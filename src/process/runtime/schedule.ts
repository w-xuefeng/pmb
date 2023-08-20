import type { Subprocess } from "bun";
import { KeepProcessAlive } from "./keep-alive";
import { BunProcessRuntime } from "./runtime";

export let globalAlive: KeepProcessAlive;

export const globalSubprocess = new Map<number, Subprocess>();

export function startHeadrCheck(interval = 10 * 1000) {
  globalAlive?.free?.();
  globalAlive = KeepProcessAlive.create(
    () => BunProcessRuntime.checkProcesses(),
    interval
  );
  globalAlive.start();
}

export function stopHeadrCheck() {
  globalAlive?.stop();
}
