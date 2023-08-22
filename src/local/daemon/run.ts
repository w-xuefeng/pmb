import Tell from "../../shared/utils/tell";
import { L } from "../../shared/utils";
import { resolve } from "path";
import {
  DAEMON_LOG_PATH,
  DAEMON_PID_PATH,
  SERVICE_ROOT_DIR,
  DaemonPingStatus,
} from "../../shared/const";
import { createPathSync } from "../../shared/utils/file";

/**
 * create a talk
 */
const tell = new Tell();

/**
 * update talk port
 */
const updatePort = (running: false | number[]) => {
  if (!running) {
    return;
  }
  const [_, port] = running;
  if (!port) {
    return;
  }
  tell.updatePort(port);
};

/**
 * Check if the daemon is running
 */
async function checkDaemon() {
  const file = Bun.file(DAEMON_PID_PATH);
  const exists = await file.exists();
  if (exists) {
    const content = await file.text();
    const [pid, port] = content?.split("|");
    return [pid, port].map((e) => Number(e)).filter((e) => !!e);
  }
  return false;
}

/**
 * Start daemon
 */
async function startDaemon() {
  const logPath = DAEMON_LOG_PATH();
  const log = Bun.file(logPath);
  const exists = await log.exists();
  if (!exists) {
    createPathSync("file", logPath);
  }
  const ps = Bun.spawn({
    cmd: ["bun", resolve(import.meta.dir, "start-service.ts")],
    cwd: SERVICE_ROOT_DIR,
    stdout: log,
  });
  await Bun.sleep(1800);
  const running = await checkDaemon();
  updatePort(running);
  ps.unref();
}

/**
 * Say hello to daemon
 */
async function pingDaemon(port: number) {
  try {
    tell.updatePort(port);
    const text = await tell.ping();
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

export default async function greetDaemon() {
  /**
   * check daemon service has been running or not
   */
  const daemonHasRunning = await checkDaemon();

  /**
   * if it is not running,
   * start it
   */
  if (!daemonHasRunning) {
    await startDaemon();
    return tell;
  }

  /**
   * if pid or port is unavailable,
   * start it
   */
  const [pid, port] = daemonHasRunning;
  if (!pid || !port) {
    await startDaemon();
    return tell;
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
    await startDaemon();
    return tell;
  }

  /**
   * if pong response is OUTDATED,
   * may be your local pmb version is outdated
   */
  if (pong === DaemonPingStatus.OUTDATED) {
    L.warn("please upgrade your pmb version");
    return tell;
  }

  return tell;
}
