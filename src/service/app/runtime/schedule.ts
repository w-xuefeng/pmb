import type { Subprocess } from "bun";
import { resolve } from "path";
import { BunProcessRuntime } from "./runtime";
import { KeepProcessAlive } from "./keep-alive";
import { DAEMON_PID_PATH } from "../../../shared/const";
import { Setting } from "../../../shared/utils/setting";

export let globalAlive: KeepProcessAlive;

export const globalSubprocess = new Map<number, Subprocess>();

export async function autoRestartDaemon() {
  const file = Bun.file(DAEMON_PID_PATH);
  const exists = await file.exists();
  if (!exists) {
    return;
  }
  const content = await file.text();
  const [pid, _port, startTime] = content?.split("|");
  const duration = Date.now() - Number(startTime);
  /**
   * if the duration of the daemon exceeds 24 hours,
   * restart the daemon
   */
  if (duration > 24 * 60 * 60 * 1000) {
    Bun.spawn({
      cmd: [
        "bun",
        resolve(import.meta.dir, "../../../shared/daemon/daemon-restarter.ts"),
        `${process.pid || pid}`,
      ],
      stdout: "inherit",
    }).unref();
  }
}

export async function startHeartbeatCheck() {
  const interval = await Setting.getSetting("polling.interval", 10 * 1000);
  globalAlive?.free?.();
  globalAlive = KeepProcessAlive.create(async () => {
    await autoRestartDaemon();
    return BunProcessRuntime.checkProcesses();
  }, interval);
  globalAlive.start();
}

export function stopHeadrCheck() {
  globalAlive?.stop();
}
