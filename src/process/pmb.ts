import { BunProcess } from "./runtime/bun-process";
import { BunProcessRuntime } from "./runtime/runtime";
import { L, intlTimeFormat, nanoid, singleton } from "../../utils";
import { BunProcessStatus, BunProcessStatusColor } from "./const";

class PMB {
  #processPool = new Map<string, BunProcess>();

  #createProcessName(entry: string) {
    return `${nanoid(6)}-${entry.split("/").at(-1)}`;
  }

  async #updateProcessPool() {
    const ps = await BunProcessRuntime.getProcesses();
    this.#processPool = new Map(ps);
  }

  async start(entry: string, name?: string, starter?: string) {
    /**
     * if name is undefined,
     * will create a name by entry file name and randomUUID
     */
    if (!name) {
      name = this.#createProcessName(entry);
    }

    /**
     * get process from system to process pool
     */
    await this.#updateProcessPool();

    let p = this.#processPool.get(name);
    if (!p) {
      p = new BunProcess(name, entry, starter);
    }
    if (p.status !== BunProcessStatus.RUNNING) {
      p.start();
    } else {
      L.warn(
        `the service start from entry file "${entry}" has been run, name is "${p.name}", pid is "${p.pid}"`
      );
    }
  }

  async stop(type: "pid" | "name", value: string) {
    if (type === "pid") {
      await BunProcessRuntime.stopByPid(Number(value));
    }
    if (type === "name") {
      await BunProcessRuntime.stopByName(value);
    }
  }

  async rm(type: "pid" | "name", value: string) {
    if (type === "pid") {
      await BunProcessRuntime.removeProcessByPid(Number(value));
    }
    if (type === "name") {
      await BunProcessRuntime.removeProcess(value);
    }
  }

  async list() {
    await this.#updateProcessPool();
    const list = [...this.#processPool.entries()].map((e) => {
      const [name, pc] = e;
      const startTime = pc.startTimes.at(-1);
      const item = Object.assign(
        Object.create({
          __statusColor: BunProcessStatusColor[BunProcessStatus[pc.status]],
        }),
        {
          name,
          pid: pc.pid,
          starter: pc.starter,
          entry: pc.entryFile,
          status: BunProcessStatus[pc.status],
          startTime: startTime ? intlTimeFormat(new Date(startTime)) : "-",
        }
      );
      return item;
    });
    L.Logo();
    L.table(list, "No process running by pmb!");
  }
}

export default singleton<PMB, typeof PMB>(PMB);
