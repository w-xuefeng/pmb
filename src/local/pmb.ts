import open from "open";
import greetDaemon from "./daemon/run";
import { L, bunProcessVOToTable, nanoid, singleton } from "../shared/utils";
import {
  BunProcessStatus,
  DAEMON_LOG_PATH,
  DAEMON_PID_PATH,
  DaemonPingStatus,
  PROCESS_MAX_RESTART_COUNT,
  readConf,
} from "../shared/const";
import { unlinkSync } from "../shared/utils/file";
import type { IBunProcessVO } from "../shared/utils/types";
import Tell from "../shared/utils/tell";

class PMB {
  /**
   * create a name
   */
  #createProcessName(entry: string) {
    return `${nanoid(6)}-${entry.split("/").at(-1)}`;
  }

  /**
   * manage process
   */

  async start(entry: string, name?: string, starter?: string) {
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
        const ps = rs.data[0];
        L.warn(
          `the service started by "${ps.entry}" has been run, name is "${name}", pid is "${ps.pid}"`
        );
        return;
      }
    } else {
      name = this.#createProcessName(entry);
    }

    /**
     * the number of process-auto-restart
     */
    const restart = await readConf("restart", PROCESS_MAX_RESTART_COUNT);

    /**
     * the current working directory of the process
     */
    const cwd = await readConf("cwd", process.cwd());

    /**
     * Tell the daemon to start the service
     */
    const res = await tell.start({ name, entry, cwd, starter, restart });

    if (res.data) {
      this.list(res.data);
    }
  }

  async stop(type: "pid" | "name", value: string) {
    /**
     * say hello to daemon process
     */
    const tell = await greetDaemon();

    if (type === "pid") {
      /**
       * Tell the daemon to use pid to stop this service
       */
      const res = await tell.stop({ pid: Number(value) });
      res?.data && this.list(res.data);
    }
    if (type === "name") {
      /**
       * Tell the daemon to use name to stop this service
       */
      const res = await tell.stop({ name: value });
      res?.data && this.list(res.data);
    }
  }

  async rm(type: "pid" | "name", value: string) {
    /**
     * say hello to daemon process
     */
    const tell = await greetDaemon();
    if (type === "pid") {
      /**
       * Tell the daemon to use pid to stop and remove this service
       */
      const res = await tell.rm({ pid: Number(value) });
      res?.data && this.list(res.data);
    }
    if (type === "name") {
      /**
       * Tell the daemon to use name to stop and remove this service
       */
      const res = await tell.rm({ name: value });
      res?.data && this.list(res.data);
    }
  }

  async list(data?: IBunProcessVO[]) {
    const render = (list: IBunProcessVO[]) => {
      L.table(
        list.map((e) => bunProcessVOToTable(e)),
        "No process running by pmb!"
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

  async ui() {
    const tell = await greetDaemon();
    const url = tell.uiPath().toString();
    L.success(`Please visit [${url}]\n`);
    await open(url);
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
    let pid: string | undefined = void 0;

    /**
     * if daemon file exists
     * check file content and try ping port
     */
    if (exists) {
      const content = await file.text();
      const data = content?.split("|");
      const port = data[1];
      pid = data[0];
      if (pid && port) {
        const tell = new Tell(port);
        try {
          const pong = await tell.ping();
          if (pong === DaemonPingStatus.PONG) {
            output &&
              L.info(
                `The daemon has been running on port [${port}], pid is [${pid}]!\n`
              );
          } else {
            output &&
              L.warn(
                `The daemon seems to have responded to unexpected results! Perhaps you can try upgrading the version to solve this problem.\n`
              );
          }
        } catch {
          output &&
            L.warn(`The daemon seems to have not been stopped correctly!\n`);
        }
      } else {
        output &&
          L.warn(`The daemon seems to have not been stopped correctly!\n`);
      }
    } else {
      output && L.info(`The daemon not running!\n`);
    }

    return {
      file,
      exists,
      logExists,
      logPath,
      pid,
    };
  }

  async daemonStart(type = "start") {
    const tell = await greetDaemon();
    const pong = await tell.ping();
    if (pong === DaemonPingStatus.PONG) {
      L.success(
        `Daemon service ${type} successfully on port [${tell.talk.port}]\n`
      );
    }
  }

  async daemonStop(output = true) {
    const { exists, pid, logExists, logPath } = await this.daemonStatus(false);
    if (exists && pid) {
      pid && Bun.spawn(["kill", "-9", `${pid}`]).unref();
      unlinkSync(DAEMON_PID_PATH);
    }
    if (logExists) {
      unlinkSync(logPath);
    }
    output && L.success(`Daemon service has been stopped!\n`);
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
        L.tips(
          "You can use status|start|stop|restart to manage the daemon process!"
        );
        break;
    }
  }
}

export default singleton<PMB, typeof PMB>(PMB);
