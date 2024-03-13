import os from "os";
import { resolve } from "path";

/**
 * const
 */

/**
 * !!! DON'T MODIFY IT MANUALLY,
 * !!! ONLY BY SCRIPT "set-env" MODIFY IT
 * is local development environment
 */
export const __DEV__ = true;

/**
 * root directory of store process and log file
 */
export const ROOT_DIR = __DEV__
  ? /**
     * for local dev and test
     */
  resolve(import.meta.dir, "../../..")
  : /**
     * for production
     */
  resolve(os.homedir(), ".pm-bun");

/**
 * daemon service root directory
 */
export const SERVICE_ROOT_DIR = resolve(import.meta.dir, "../../service");

/**
 * default process max restart count
 */
export const PROCESS_MAX_RESTART_COUNT = 10;

/**
 * daemon pid file path
 * to save daemon service pid and port
 */
export const DAEMON_PID_PATH = resolve(
  ROOT_DIR,
  ".runtime",
  ".pmb",
  ".pmb-daemon"
);

/**
 * i18n config file path
 * to save current display language
 * just support [zhCN] and [enUS]
 */
export const LANGUAGE_PATH = resolve(ROOT_DIR, ".runtime", ".pmb", ".pmb-lang");

/**
 * custom setting file path
 * to save some setting-config for customer
 */
export const CUSTOM_SETTING_PATH = resolve(
  ROOT_DIR,
  ".runtime",
  ".pmb",
  ".pmb-setting"
);

/**
 * daemon service and other process log path
 */
export const DAEMON_LOG_PATH = (name = "") =>
  resolve(ROOT_DIR, ".runtime", ".pmb", "logs", `${name}.pmb.log`);

/**
 * process record file path
 */
export const processPath = resolve(ROOT_DIR, ".runtime", ".process");

/**
 * enum
 */

/**
 * the response category from ping daemon
 */
export enum DaemonPingStatus {
  PONG = "pong",
  ERROR = "error",
  FAILED = "failed",
  OUTDATED = "outdated",
}

/**
 * process status
 */
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

/**
 * process status display color
 */
export enum BunProcessStatusColor {
  NOT_RUNNING = "red",
  RUNNING = "green",
  MANUAL_STOP = "gray",
}

/**
 * read custom config
 * use default value if not custom config
 * custom config could be created via a ".pmb.config.ts" file in project root directory
 */
export async function readConf<K extends string | string[]>(
  nameOrNames: K,
  defaultValue: K extends string[] ? Record<K[number], any> : any,
  cwd?: string
) {
  const names: string[] =
    typeof nameOrNames === "string" ? [nameOrNames] : nameOrNames;
  const md = await import(`${cwd || process.cwd()}/.pmb.config.ts`).catch(
    () => ({
      default: void 0,
    })
  );
  const config = md?.default;
  const rs =
    typeof config === "function"
      ? config()
      : typeof config === "object" && md.default !== null
        ? config
        : defaultValue;
  if (!Array.isArray(nameOrNames)) {
    return rs?.[names[0]] ?? defaultValue;
  }
  return Object.fromEntries(
    names.map((name) => [name, rs?.[name] ?? defaultValue?.[name]])
  );
}

/**
 * operation system platform
 * 'aix', 'darwin', 'freebsd','linux','openbsd', 'sunos', and 'win32'
 */
export const OSP = os.platform();

/**
 * operation system platform is windows
 */
export const isWin = OSP === 'win32';
