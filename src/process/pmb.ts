import { BunProcess } from "./runtime/bun-process";
import { BunProcessRuntime } from "./runtime/runtime";
import { L, nanoid, singleton } from "../../utils";
import { BunProcessStatus } from "./const";

class PMB {
  #processPool = new Map<string, BunProcess>();

  #createProcessName(entry: string) {
    return `${nanoid(6)}-${entry.split("/").at(-1)}`;
  }

  async #updateProcessPool() {
    const ps = await BunProcessRuntime.getProcesses();
    this.#processPool = new Map(ps);
  }

  async start(entry: string, name?: string) {
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
      p = new BunProcess(name, entry);
    }
    if (p.status !== BunProcessStatus.RUNNING) {
      p.start();
    } else {
      L.warn(
        `the service start from entry file "${entry}" has been run, name is "${p.name}", pid is "${p.pid}"`
      );
    }
  }

  async list() {
    await this.#updateProcessPool();
    console.log(this.#processPool);
  }
}

export default singleton<PMB, typeof PMB>(PMB);
