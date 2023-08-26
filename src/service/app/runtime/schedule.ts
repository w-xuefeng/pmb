import type { Subprocess } from "bun";
import { KeepProcessAlive } from "./keep-alive";
import { BunProcessRuntime } from "./runtime";
import { Setting } from "../../../shared/utils/setting";

export let globalAlive: KeepProcessAlive;

export const globalSubprocess = new Map<number, Subprocess>();

export async function startHeadrCheck() {
  const interval = await Setting.getSetting("polling.interval", 10 * 1000);
  globalAlive?.free?.();
  globalAlive = KeepProcessAlive.create(() => {
    return BunProcessRuntime.checkProcesses();
  }, interval);
  globalAlive.start();
}

export function stopHeadrCheck() {
  globalAlive?.stop();
}
