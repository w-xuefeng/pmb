import type { Subprocess } from "bun";
import { resolve } from "path";
import { BunProcessRuntime } from "./runtime";
import { KeepProcessAlive } from "./keep-alive";
import { Setting } from "../../../shared/utils/setting";
import { getDaemonInfo, useLogger } from "../../../shared/utils";

export let globalAlive: KeepProcessAlive;

export const globalSubprocess = new Map<number, Subprocess>();

const Logger = useLogger("heart beat schedule");

export async function autoRestartDaemon() {
  const daemon = await getDaemonInfo();

  if (!daemon.length) {
    return;
  }
  const current = daemon.find((e) => Number(e.pid) === process.pid);
  const lastStartTime = current?.timeStamp || 0;

  const duration = Date.now() - Number(lastStartTime);
  /**
   * if the duration of the daemon exceeds 24 hours,
   * restart the daemon
   */
  // if (duration > 24 * 60 * 60 * 1000) {
  if (duration > 10 * 1000) {
    Logger(`daemon service will restart from process [${process.pid}]`);
    Bun.spawn({
      cmd: [
        "bun",
        resolve(import.meta.dir, "../../../shared/daemon/daemon-restarter.ts"),
        `${process.pid}`,
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

export function stopHeartbeatCheck() {
  globalAlive?.stop();
}
