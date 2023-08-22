import { resolve } from "path";

export async function readConf(name: string, defaultValue: any) {
  const md = await import(`${process.cwd()}/.pmb.config.ts`).catch(() => ({
    default: void 0,
  }));
  const config = md?.default;
  if (typeof config === "function") {
    return config()?.[name] ?? defaultValue;
  }
  if (typeof config === "object" && md.default !== null) {
    return config[name] ?? defaultValue;
  }
  return defaultValue;
}

export const ROOT_DIR = resolve(import.meta.dir, "../../..");
export const SERVICE_ROOT_DIR = resolve(import.meta.dir, "../../service");

export const PROCESS_MAX_RESTART_COUNT = 10;

export enum DaemonPingStatus {
  PONG = "pong",
  ERROR = "error",
  FAILED = "failed",
  OUTDATED = "outdated",
}

export enum BunProcessStatus {
  /**
   * process not running，
   * it will try to restart
   */
  NOT_RUNNING = 0,
  /**
   * process is running
   */
  RUNNING = 1,
  /**
   * process stoped by manual
   */
  MANUAL_STOP = 3,
}

export enum BunProcessStatusColor {
  NOT_RUNNING = "red",
  RUNNING = "green",
  MANUAL_STOP = "gray",
}

export const DAEMON_PID_PATH = resolve(
  ROOT_DIR,
  ".runtime",
  ".pmb",
  ".pmb-daemon"
);

export const DAEMON_LOG_PATH = (name = "") =>
  resolve(ROOT_DIR, ".runtime", ".pmb", `${name}.pmb-daemon.log`);

export const processPath = resolve(ROOT_DIR, ".runtime", ".process");
