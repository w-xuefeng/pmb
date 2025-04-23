import type { Subprocess } from "bun";
import { BunProcessRuntime } from "./runtime";
import { KeepProcessAlive } from "./keep-alive";
import { Setting } from "../../../shared/utils/setting";

export let globalAlive: KeepProcessAlive;

export const globalSubprocess = new Map<number, Subprocess>();

export async function startHeartbeatCheck() {
  const interval = await Setting.getSetting("polling.interval", 10 * 1000);
  globalAlive?.free?.();
  globalAlive = KeepProcessAlive.create(async () => {
    return BunProcessRuntime.checkProcesses();
  }, interval);
  globalAlive.start();
}

export function stopHeartbeatCheck() {
  globalAlive?.stop();
}
