import open from "open";
import greetDaemon from "./daemon/run";
import monit from "./daemon/monit";
import Tell from "../shared/utils/tell";
import {
  L,
  bunProcessVOToTable,
  intlTimeFormat,
  nanoid,
  singleton,
} from "../shared/utils";
import {
  BunProcessStatus,
  DAEMON_LOG_PATH,
  DAEMON_PID_PATH,
  DaemonPingStatus,
  PROCESS_MAX_RESTART_COUNT,
  readConf,
} from "../shared/const";
import { Setting } from "../shared/utils/setting";
import { getCurrentLang, useI18n } from "../i18n";
import { unlinkSync } from "../shared/utils/file";
import { getCommand } from "../shared/const/commands";
import type { IBunProcessVO } from "../shared/utils/types";
import type { IResponse } from "../shared/utils/http";

class PMB {
  /**
   * create a name
   */
  #createProcessName(entry: string) {
    return `${nanoid(6)}-${entry.split("/").at(-1)}`;
  }

  /**
   * common output handler
   */
  #output(tell: Tell, res: IResponse<IBunProcessVO[]>) {
    tell.handleResponse(res, ({ data }) => {
      data && this.list(data);
    });
  }

  /**
   * output log handler
   */
  #outputLog(
    tell: Tell,
    res: IResponse<string>,
    tips?: { type: "name" | "pid"; value: string }
  ) {
    tell.handleResponse(res, async ({ data }) => {
      const { t } = await useI18n();
      if (tips) {
        L.info(
          `${t("cli.log.outputLogTip", {
            type: t(`process.${tips.type}`),
            value: tips.value,
          })}\n`
        );
      } else {
        L.info(`${t("cli.log.outputDaeemonLogTip")}\n`);
      }
      console.log(data);
    });
  }

  /**
   * manage process
   */

  async start(entry: string, name?: string, starter?: string, args?: string) {
    /**
     * say hello to daemon process
     */
    const tell = await greetDaemon();

    /**
     * if the process has a name,
     * detect if there is a process with the same name,
     * otherwise, will create a name by entry file name and nanoid(6)
     */
    if (name) {
      const rs = await tell.list({
        name,
        status: BunProcessStatus.RUNNING,
      });
      const exists = rs?.data?.length > 0;
      if (exists) {
        const { t } = await useI18n();
        const ps = rs.data[0];
        L.warn(
          t("exception.NAME_EXISTS", {
            name,
            entry: ps.entry,
            pid: ps.pid,
          })
        );
        return;
      }
    } else {
      name = this.#createProcessName(entry);
    }

    /**
     * restart: the number of process-auto-restart
     * cwd: the current working directory of the process
     */
    const { restart, cwd } = await readConf<["restart", "cwd"]>(
      ["restart", "cwd"],
      {
        restart: PROCESS_MAX_RESTART_COUNT,
        cwd: process.cwd(),
      }
    );

    /**
     * Tell the daemon to start the service
     */
    const res = await tell.start({ name, entry, cwd, starter, restart, args });
    this.#output(tell, res);
  }

  async restart(type: "name" | "pid", value: string, reset?: number | boolean) {
    /**
     * say hello to daemon process
     */
    const tell = await greetDaemon();
    /**
     * tell the daemon to use name or pid to restart this service
     */
    const res = await tell.restart({ [type]: value, reset });
    this.#output(tell, res);
  }

  async stop(type: "pid" | "name", value: string) {
    /**
     * say hello to daemon process
     */
    const tell = await greetDaemon();
    /**
     * tell the daemon to use name or pid to stop this service
     */
    const res = await tell.stop({ [type]: value });
    this.#output(tell, res);
  }

  async rm(type: "pid" | "name", value: string) {
    /**
     * say hello to daemon process
     */
    const tell = await greetDaemon();
    /**
     * tell the daemon to use name or pid to stop and remove this service
     */
    const res = await tell.rm({ [type]: value });
    this.#output(tell, res);
  }

  async list(data?: IBunProcessVO[]) {
    const { t } = await useI18n();
    const render = (list: IBunProcessVO[]) => {
      L.table(
        list.map((e) => bunProcessVOToTable(e, void 0, t)),
        t("process.listEmpty")
      );
    };

    if (data) {
      render(data);
      return;
    }

    /**
     * say hello to daemon process
     */
    const tell = await greetDaemon();
    const rs = await tell.list();
    if (rs.data) {
      render(rs.data);
    }
  }

  async monit() {
    await monit();
  }

  async ui(enabled?: boolean) {
    const { t } = await useI18n();
    const tell = await greetDaemon();

    const openUI = async (logPrefix = "") => {
      const url = tell.uiPath().toString();
      L.success(
        `${logPrefix ? `${logPrefix}, ` : ""}${t("cli.ui.visit")} [${url}]\n`
      );
      await open(url);
    };

    if (enabled === void 0) {
      const enableUI = await Setting.getSetting("ui.enable", true);
      if (!enableUI) {
        L.warn(t("exception.NOT_ENABLED"));
        return;
      }
      await openUI();
    }

    if (typeof enabled === "boolean") {
      await Setting.setSetting("ui", { enable: enabled });
      if (enabled) {
        await openUI(t("cli.ui.enabledSuccess"));
      } else {
        L.success(t("cli.ui.disabledSuccess"));
      }
    }
  }

  async log(type?: "pid" | "name", value?: string) {
    /**
     * say hello to daemon process
     */
    const tell = await greetDaemon();
    /**
     * tell the daemon to use name or pid to get logs
     * if not value, get daemon log
     */
    const data =
      type && value
        ? { [type]: type === "pid" ? Number(value) : value }
        : void 0;
    const tips = type && value ? { type, value } : void 0;
    const res = await tell.log(data);
    this.#outputLog(tell, res, tips);
  }

  /**
   * manage daemon
   */

  async daemonStatus(output = true) {
    const file = Bun.file(DAEMON_PID_PATH);
    const logPath = DAEMON_LOG_PATH();
    const logFile = Bun.file(logPath);
    const exists = await file.exists();
    const logExists = await logFile.exists();
    const { t } = await useI18n();
    let pid: string | undefined = void 0;

    /**
     * if daemon file exists
     * check file content and try ping port
     */
    if (exists) {
      const content = await file.text();
      const data = content?.split("|");
      const port = data[1];
      const time = data[2] ? intlTimeFormat(Number(data[2])) : void 0;
      pid = data[0];
      if (pid && port && time) {
        const tell = new Tell(port);
        try {
          const pong = await tell.ping();
          if (pong === DaemonPingStatus.PONG) {
            output &&
              L.info(
                `${t("cli.daemon.hasRunning", {
                  port,
                  pid,
                  time,
                })}\n`
              );
          } else {
            output && L.warn(`${t("cli.daemon.unexpected")}\n`);
          }
        } catch {
          output && L.warn(`${t("cli.daemon.stopException")}\n`);
        }
      } else {
        output && L.warn(`${t("cli.daemon.stopException")}\n`);
      }
    } else {
      output && L.info(`${t("cli.daemon.notRunning")}\n`);
    }

    return {
      file,
      exists,
      logExists,
      logPath,
      pid,
    };
  }

  async daemonStart(type: "start" | "restart" = "start") {
    const tell = await greetDaemon();
    const pong = await tell.ping();
    const { t } = await useI18n();
    if (pong === DaemonPingStatus.PONG) {
      L.success(
        `${t("cli.daemon.started", {
          type: t(`cli.daemon.${type}`),
          port: tell.talk.port,
        })}\n`
      );
    }
  }

  async daemonStop(output = true) {
    const { exists, pid, logExists, logPath } = await this.daemonStatus(false);
    if (exists && pid) {
      Bun.spawn(getCommand("taskkill", `${pid}`).command).unref();
      unlinkSync(DAEMON_PID_PATH);
    }
    if (logExists) {
      unlinkSync(logPath);
    }
    const { t } = await useI18n();
    output && L.success(`${t("cli.daemon.stopped")}\n`);
  }

  async daemon(type: "status" | "start" | "stop" | "restart") {
    switch (type) {
      case "status":
        await this.daemonStatus();
        break;

      case "start":
        await this.daemonStart();
        break;

      case "stop":
        await this.daemonStop();
        break;

      case "restart":
        await this.daemonStop(false);
        await this.daemonStart("restart");
        break;

      default:
        const { t } = await useI18n();
        L.tips(`${t("cli.daemon.manageTips")}\n`);
        break;
    }
  }

  async setLang() {
    const tell = await greetDaemon();
    const current = await getCurrentLang();
    const res = await tell.setLang({
      lang: current === "zhCN" ? "enUS" : "zhCN",
    });
    tell.handleResponse(res, async ({ data }) => {
      const { t } = await useI18n();
      L.success(t("cli.lang.set"));
    });
  }

  async upgrade(currentVersion: string) {
    const rs = Bun.spawnSync(['npm', 'view', 'pm-bun', 'version']);
    const latestVersion = rs.stdout.toString().trim();
    const { t } = await useI18n();
    if (currentVersion === latestVersion) {
      L.color(
        [t('cli.upgrade.congrats'), t('cli.upgrade.latestVersion'), `(${t('cli.upgrade.whichIsVersion')} v${latestVersion})`],
        ['green', 'white', 'gray']
      );
      return
    }
    L.color(
      [`${t('cli.upgrade.findNewVersion')} ${latestVersion},`, `${t('cli.upgrade.startDownloading')}...`],
      ['green', 'white']
    );
    Bun.spawn({
      cmd: ['bun', 'add', '-g', `pm-bun@${latestVersion}`],
      stdout: "inherit",
      onExit() {
        Bun.spawnSync(['pmb', 'daemon', 'restart']);
        L.color(
          [t('cli.upgrade.congrats'), t('cli.upgrade.latestVersion'), `(${t('cli.upgrade.whichIsVersion')} v${latestVersion})`],
          ['green', 'white', 'gray']
        );
      }
    })
  }
}

export default singleton<PMB, typeof PMB>(PMB);
