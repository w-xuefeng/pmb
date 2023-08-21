import { L, bunProcessVOToTable, nanoid, singleton } from "../shared/utils";
import greetDaemon from "./daemon/run";
import type { IBunProcessVO } from "../shared/utils/types";
import { BunProcessStatus } from "../shared/const";

class PMB {
  /**
   * create a name
   */
  #createProcessName(entry: string) {
    return `${nanoid(6)}-${entry.split("/").at(-1)}`;
  }

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
     * Tell the daemon to start the service
     */
    const res = await tell.start({ name, entry, starter });

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

  async ui() {}
}

export default singleton<PMB, typeof PMB>(PMB);
