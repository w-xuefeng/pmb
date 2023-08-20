import { BunProcessRuntime } from "./runtime";
import { BunProcessStatus, daemonLogPath } from "../const";
import { globalSubprocess } from "./schedule";
import greetDaemon from "../daemon/run";

export class BunProcess {
  name: string;
  entryFile: string;
  status = BunProcessStatus.NOT_RUNNING;
  startTimes: number[] = [];
  port?: number;
  pid?: string | number;
  starter = "bun";
  constructor(name: string, entryFile: string, starter = "bun") {
    this.name = name;
    this.entryFile = entryFile;
    this.starter = starter;
  }

  async start() {
    greetDaemon();
    const ps = Bun.spawn({
      cmd: [this.starter, this.entryFile],
      stdout: Bun.file(daemonLogPath(this.name)),
    });
    this.status = BunProcessStatus.RUNNING;
    this.startTimes.push(Date.now());
    this.pid = ps.pid;
    globalSubprocess.set(ps.pid, ps);
    BunProcessRuntime.addProcess(this);
    ps.unref();
  }

  async reStart() {
    console.log(`Trying to restart task '${this.name}'`);
    await this.start();
  }
}
