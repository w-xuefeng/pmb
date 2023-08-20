import { L } from "../../../utils";
import { daemonLogPath, daemonPidPath } from "../const";
import { resolve } from "path";
import pkg from "../../../package.json";

enum DaemonPingStatus {
  PONG = "pong",
  ERROR = "error",
  FAILED = "failed",
  OUTDATED = "outdated",
}

function startDaemon() {
  Bun.spawn({
    cmd: ["bun", resolve(import.meta.dir, "start-service.ts")],
    stdout: Bun.file(daemonLogPath()),
  }).unref();
}

async function checkDaemon() {
  const file = Bun.file(daemonPidPath);
  const exists = await file.exists();
  if (exists) {
    const content = await file.text();
    const [pid, port] = content?.split("|");
    return [pid, port].map((e) => Number(e)).filter((e) => !!e);
  }
  return false;
}

async function pingDaemon(port: number) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/ping`, {
      headers: {
        "x-action": "ping",
        "x-version": pkg.version,
      },
    });
    const text = await res.text();
    const actionMap = {
      [DaemonPingStatus.PONG]: () => DaemonPingStatus.PONG,
      [DaemonPingStatus.OUTDATED]: () => DaemonPingStatus.OUTDATED,
      default: () => DaemonPingStatus.FAILED,
    };
    return actionMap[text in actionMap ? text : "default"]();
  } catch (error) {
    return DaemonPingStatus.ERROR;
  }
}

export default async function daemon() {
  /**
   * check daemon service has been running or not
   */
  const daemonHasRunning = await checkDaemon();

  /**
   * if it is not running,
   * start it
   */
  if (!daemonHasRunning) {
    startDaemon();
    return;
  }

  /**
   * if pid or port is unavailable,
   * start it
   */
  const [pid, port] = daemonHasRunning;
  if (!pid || !port) {
    startDaemon();
    return;
  }

  /**
   * ping daemon service
   */
  const pong = await pingDaemon(port);

  /**
   * if ping-action occur error,
   * start it
   */
  if (pong === DaemonPingStatus.ERROR) {
    startDaemon();
    return;
  }

  /**
   * if pong response is OUTDATED,
   * may be your local pmb version is outdated
   */
  if (pong === DaemonPingStatus.OUTDATED) {
    L.warn("please upgrade your pmb version");
    return;
  }
}
