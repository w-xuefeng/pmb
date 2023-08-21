import { BunProcessStatus, DAEMON_LOG_PATH } from "../../../shared/const";
import { bunProcessToVO } from "../../../shared/utils";
import { createPathSync } from "../../../shared/utils/file";
import { BunProcessRuntime } from "./runtime";
import { globalSubprocess } from "./schedule";

export class BunProcess {
  name: string;
  entryFile: string;
  status = BunProcessStatus.NOT_RUNNING;
  startTimes: number[] = [];
  port?: number;
  pid?: string | number;
  starter = "bun";
  restRestartCount = 10;
  constructor(name: string, entryFile: string, starter = "bun", restart = 10) {
    this.name = name;
    this.entryFile = entryFile;
    this.starter = starter;
    this.restRestartCount = restart;
  }

  async start() {
    const logPath = DAEMON_LOG_PATH(this.name);
    const log = Bun.file(logPath);
    const exists = await log.exists();
    if (!exists) {
      createPathSync("file", logPath);
    }
    const ps = Bun.spawn({
      cmd: [this.starter, this.entryFile],
      stdout: log,
    });
    this.status = BunProcessStatus.RUNNING;
    this.startTimes.push(Date.now());
    this.pid = ps.pid;
    ps.unref();
    BunProcessRuntime.addProcess(this);
    globalSubprocess.set(ps.pid, ps);
  }

  async reStart() {
    console.log(`Trying to restart task '${this.name}'`);
    await this.start();
  }

  toVO() {
    return bunProcessToVO(this);
  }
}
