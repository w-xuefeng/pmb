import { resolve } from "path";
import {
  BunProcessStatus,
  DAEMON_LOG_PATH,
  PROCESS_MAX_RESTART_COUNT,
  processPath,
  readConf,
} from "../../../shared/const";
import {
  createPathSync,
  existsSync,
  getFilesFromDir,
  tryDeleteBunFile,
} from "../../../shared/utils/file";
import { useI18n } from "../../../i18n";
import { BunProcess } from "./bun-process";
import { globalSubprocess } from "./schedule";
import { getCommand } from "../../../shared/const/commands";

export class BunProcessRuntime {
  static path = processPath;
  static suffix = ".process" as const;

  static pName2fName(pName: string) {
    if (pName.endsWith(this.suffix)) {
      return pName;
    }
    return `${pName}${this.suffix}`;
  }

  static fName2pName(fName: string) {
    let pName = fName;
    if (fName.endsWith(this.suffix)) {
      const arr = fName.split(".");
      arr.pop();
      pName = arr.join(".");
    }
    if (pName.startsWith("/")) {
      pName = pName.slice(1);
    }
    return pName;
  }

  static async getProcesses() {
    const exists = existsSync(this.path);
    if (!exists) {
      createPathSync("dir", this.path);
    }
    const processes: [string, BunProcess][] = [];
    const files = await getFilesFromDir(this.path, `*${this.suffix}`);
    for (const file of files) {
      const processName = this.fName2pName(file.replace(this.path, ""));
      const processContent = await Bun.file(file).json();
      processes.push([processName, processContent]);
    }
    return processes;
  }

  static async addProcess(ps: BunProcess) {
    await Bun.write(
      resolve(this.path, this.pName2fName(ps.name)),
      JSON.stringify(ps, null, 2)
    );
  }

  static async updateProcess(name: string, ps: BunProcess) {
    await Bun.write(
      resolve(this.path, this.pName2fName(name)),
      JSON.stringify(ps, null, 2)
    );
  }

  static async removeProcess(name: string) {
    const filePath = resolve(this.path, this.pName2fName(name));
    const logPath = DAEMON_LOG_PATH(name);

    const bunFile = Bun.file(filePath);
    const bunLogFile = Bun.file(logPath);

    const exists = await bunFile.exists();
    const logExists = await bunLogFile.exists();

    if (exists) {
      const pc = (await bunFile.json()) as BunProcess;
      if (pc.status === BunProcessStatus.RUNNING) {
        this.stop(pc.pid);
      }
      await tryDeleteBunFile(bunFile);
    }
    if (logExists) {
      await tryDeleteBunFile(bunLogFile);
    }
  }

  static async removeProcessByPid(pid?: number | string) {
    if (!pid) {
      return false;
    }
    const ps = await this.getProcesses();
    const item = ps.find((e) => e[1].pid === pid);
    if (item) {
      const [name] = item;
      this.removeProcess(name);
    }
  }

  static async processStatus(pid?: number | string) {
    if (!pid) {
      return false;
    }
    const sp = globalSubprocess.get(Number(pid));
    let isRunning = false;
    if (sp) {
      isRunning = !sp.killed;
    } else {
      const { command, parseOutput } = getCommand("taskInfo", `${pid}`);
      const subps = Bun.spawn({
        cmd: command,
      });
      const path = await new Response(subps.stdout).text();
      isRunning = !!parseOutput(path);
    }
    return isRunning;
  }

  static async checkProcesses() {
    const ps = await this.getProcesses();
    const res = await Promise.all(
      ps.map((p) => {
        const [_, pc] = p;
        return this.processStatus(pc.pid);
      })
    ).then((rs) =>
      ps.map(([_, pc], i) => ({
        bunProcess: pc,
        isRunning: rs[i],
      }))
    );

    for (let i = 0; i < res.length; i++) {
      const { isRunning, bunProcess } = res[i];
      /**
       * if current status is not same process status,
       * run updateProcess to update status
       */
      if (isRunning && bunProcess.status !== BunProcessStatus.RUNNING) {
        bunProcess.status = BunProcessStatus.RUNNING;
      }
      if (!isRunning && bunProcess.status == BunProcessStatus.RUNNING) {
        bunProcess.status = BunProcessStatus.NOT_RUNNING;
      }
      await this.updateProcess(bunProcess.name, bunProcess);

      /**
       * if current status is NOT_RUNNING,
       * try to restart it
       */
      if (bunProcess.status === BunProcessStatus.NOT_RUNNING) {
        await this.tryReStartByName(bunProcess.name);
      }
    }
  }

  static async tryReStartByName(
    name: string,
    force = false,
    reset: boolean | number = false
  ) {
    const fileName = resolve(this.path, this.pName2fName(name));
    const bunFile = Bun.file(fileName);
    const exists = await bunFile.exists();
    if (!exists) {
      return;
    }
    const pc = (await bunFile.json()) as BunProcess;

    const entryBunfFile = Bun.file(resolve(pc.cwd, pc.entryFile));
    const entryBunfFileExists = await entryBunfFile.exists();
    /**
     * if entry file not exists,
     * cancel restart
     */
    if (!entryBunfFileExists) {
      return;
    }

    /**
     * if restRestartCount is null or undefined,
     * it means it is Infinity
     */
    pc.restRestartCount = pc.restRestartCount ?? Infinity;
    /**
     * if it is not a forced restart,
     * ignore if the remaining number of restarts is less than or equal to 0
     */
    if (pc.restRestartCount <= 0 && !force) {
      return;
    }

    /**
     * reset rest restart count
     */
    if (force && reset) {
      /**
       * if typeof reset is boolean and value is true, reset to initial value
       */
      if (typeof reset === "boolean") {
        const initialRestartCount = await readConf(
          "restart",
          PROCESS_MAX_RESTART_COUNT,
          pc.cwd
        );
        pc.restRestartCount = initialRestartCount;
      }
      /**
       * if typeof reset is number and value is not 0, reset to this value
       */
      if (typeof reset === "number") {
        pc.restRestartCount = reset;
      }
    }

    pc.pid && globalSubprocess.delete(Number(pc.pid));
    await this.removeProcess(name);
    const next = new BunProcess(
      name,
      pc.entryFile,
      pc.starter,
      /**
       * if it is a forced restart,
       * it does not consume the number of times
       */
      force ? pc.restRestartCount : pc.restRestartCount - 1,
      pc.cwd,
      pc.args
    );
    next.startTimes = pc.startTimes;
    next.reStart(force);
  }

  static async tryReStartByPid(
    pid: number,
    force = false,
    reset: boolean | number = false
  ) {
    const ps = await this.getProcesses();
    const item = ps.find((e) => e[1].pid === pid);
    if (item) {
      const [name] = item;
      await this.tryReStartByName(name, force, reset);
    }
  }

  static stop(pid?: number | string) {
    if (!pid) {
      return;
    }
    const p = globalSubprocess.get(Number(pid));
    if (p) {
      p.kill();
      globalSubprocess.delete(p.pid);
    } else {
      Bun.spawn(getCommand("taskkill", `${pid}`).command).unref();
    }
  }

  static async stopByPid(pid: number) {
    const ps = await this.getProcesses();
    const item = ps.find((e) => e[1].pid === pid);
    if (item) {
      const [name, pc] = item;
      pc.status === BunProcessStatus.RUNNING && this.stop(pid);
      if (pc.status !== BunProcessStatus.MANUAL_STOP) {
        pc.status = BunProcessStatus.MANUAL_STOP;
        await this.updateProcess(name, pc);
      }
    }
  }

  static async stopByName(name: string) {
    const bunFile = Bun.file(resolve(this.path, this.pName2fName(name)));
    const exists = await bunFile.exists();
    if (!exists) {
      return;
    }
    const pc = (await bunFile.json()) as BunProcess;
    if (pc && pc.status !== BunProcessStatus.MANUAL_STOP) {
      pc.status === BunProcessStatus.RUNNING && this.stop(pc.pid);
      pc.status = BunProcessStatus.MANUAL_STOP;
      await this.updateProcess(name, pc);
    }
  }

  static async catLogByName(name?: string, date?: string) {
    const { t } = await useI18n();
    /**
     * if not name,
     * return daemon log
     */
    const logPath = DAEMON_LOG_PATH(name, new Date(date ?? Date.now()));
    const log = Bun.file(logPath);
    const exists = await log.exists();
    if (!exists) {
      return {
        status: false,
        content: date ? t("process.notDateLog", { date }) : t("process.notLog"),
      };
    }
    /**
     * log content
     * the log content may be large,
     * and further optimization processing is needed
     * !!TODO optimization
     */
    const logContent = await log.text();
    return {
      status: true,
      content: logContent,
    };
  }

  static async catLogByPid(pid?: number | string, date?: string) {
    if (!pid) {
      /**
       * if not pid,
       * return daemon log
       */
      return await this.catLogByName(void 0, date);
    }
    const ps = await this.getProcesses();
    const { t } = await useI18n();
    const item = ps.find((e) => Number(e[1].pid) === Number(pid));
    if (item) {
      const [name] = item;
      return await this.catLogByName(name, date);
    }
    return {
      status: false,
      content: t("process.notExist"),
    };
  }
}
