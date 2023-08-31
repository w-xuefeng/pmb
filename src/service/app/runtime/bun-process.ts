import { resolve } from "path";
import { BunProcessStatus, DAEMON_LOG_PATH } from "../../../shared/const";
import {
  bunProcessToVO,
  logProcessExit,
  logProcessStart,
} from "../../../shared/utils";
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
  cwd = process.cwd();
  constructor(
    name: string,
    entryFile: string,
    starter = "bun",
    restart = 10,
    cwd = process.cwd()
  ) {
    this.name = name;
    this.entryFile = entryFile;
    this.starter = starter;
    this.restRestartCount = restart ?? Infinity;
    this.cwd = cwd;
  }

  async start() {
    const entryBunfFile = Bun.file(resolve(this.cwd, this.entryFile));
    const entryBunfFileExists = await entryBunfFile.exists();
    if (!entryBunfFileExists) {
      return;
    }
    const logPath = DAEMON_LOG_PATH(this.name);
    const log = Bun.file(logPath);
    const exists = await log.exists();
    if (!exists) {
      createPathSync("file", logPath);
    }
    const cmd = [...this.starter.split(" "), this.entryFile];
    const ps = Bun.spawn({
      cmd,
      cwd: this.cwd,
      stdout: log,
      onExit: (proc, exitCode, signalCode, error) => {
        logProcessExit(cmd, this, proc, signalCode, exitCode, error);
      },
    });
    this.status = BunProcessStatus.RUNNING;
    this.startTimes.push(Date.now());
    this.pid = ps.pid;
    BunProcessRuntime.addProcess(this);
    globalSubprocess.set(ps.pid, ps);
    logProcessStart(cmd, this, ps);
    ps.unref();
  }

  async reStart(force = false) {
    console.log(
      `Trying to restart task '${this.name}' ${
        force ? "manually" : "automatically"
      }, the remaining number of automatic restarts is ${this.restRestartCount}`
    );
    await this.start();
  }

  toVO() {
    return bunProcessToVO(this);
  }
}
