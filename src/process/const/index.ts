import { resolve } from "path";
import { ROOT_DIR } from "../../../utils/file";

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

export const daemonPidPath = resolve(
  ROOT_DIR,
  ".runtime",
  ".pmb",
  ".pmb-daemon"
);

export const daemonLogPath = (name = "") =>
  resolve(ROOT_DIR, ".runtime", ".pmb", `${name}.pmb-daemon.log`);

export const processPath = resolve(ROOT_DIR, ".runtime", ".process");
