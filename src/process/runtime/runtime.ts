import { resolve } from "path";
import { BunProcessStatus, daemonLogPath, processPath } from "../const";
import {
  createPathSync,
  existsSync,
  getFilesFromDir,
  unlinkSync,
} from "../../../utils/file";
import { globalSubprocess } from "./schedule";
import { BunProcess } from "./bun-process";

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
    const bunFile = Bun.file(filePath);
    const exists = await bunFile.exists();
    if (!exists) {
      return;
    }
    const pc = (await bunFile.json()) as BunProcess;
    this.stop(pc.pid);
    try {
      unlinkSync(filePath);
      unlinkSync(daemonLogPath(name));
    } catch {
      // ignore
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
      const subps = Bun.spawn({
        cmd: ["ps", "-p", `${pid}`, "-o", "comm="],
      });
      const path = await new Response(subps.stdout).text();
      isRunning = !!path;
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

  static async tryReStartByName(name: string) {
    const fileName = resolve(this.path, this.pName2fName(name));
    const bunFile = Bun.file(fileName);
    const exists = await bunFile.exists();
    if (!exists) {
      return;
    }
    const pc = (await bunFile.json()) as BunProcess;
    pc.pid && globalSubprocess.delete(Number(pc.pid));
    this.removeProcess(name);
    const next = new BunProcess(name, pc.entryFile, pc.starter);
    next.startTimes = pc.startTimes;
    next.reStart();
  }

  static stop(pid?: number | string) {
    if (!pid) {
      return;
    }
    const p = globalSubprocess.get(Number(pid));
    if (p) {
      p.kill();
    } else {
      Bun.spawn(["kill", "-9", `${pid}`]).unref();
    }
  }

  static async stopByPid(pid: number) {
    const ps = await this.getProcesses();
    const item = ps.find((e) => e[1].pid === pid);
    if (item) {
      const [name, pc] = item;
      pc.status = BunProcessStatus.MANUAL_STOP;
      await this.updateProcess(name, pc);
    }
    this.stop(pid);
  }

  static async stopByName(name: string) {
    const bunFile = Bun.file(resolve(this.path, this.pName2fName(name)));
    const exists = await bunFile.exists();
    if (!exists) {
      return;
    }
    const pc = (await bunFile.json()) as BunProcess;
    if (pc) {
      pc.status = BunProcessStatus.MANUAL_STOP;
      await this.updateProcess(name, pc);
    }
    this.stop(pc.pid);
  }
}
