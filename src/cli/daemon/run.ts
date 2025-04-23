import Tell from "../../shared/utils/tell";
import { getDaemonInfo, L } from "../../shared/utils";
import { DaemonPingStatus } from "../../shared/const";
import { useI18n } from "../../i18n";
import daemonStarter from "../../shared/daemon/daemon-starter";

/**
 * Create a talk
 */
const tell = new Tell();

/**
 * Update talk port
 */
const updatePort = (
  running:
    | false
    | {
        pid: string;
        port: number;
        time: string | undefined;
        timeStamp: number;
      }[]
) => {
  if (!running) {
    return;
  }
  const { port } = running[0];
  if (!port) {
    return;
  }
  tell.updatePort(port);
};

/**
 * Check if the daemon is running
 */
export async function checkDaemon() {
  const daemonInfo = await getDaemonInfo();
  return daemonInfo.length ? daemonInfo : false;
}

/**
 * Start daemon
 */
async function startDaemon() {
  const ps = await daemonStarter();
  await Bun.sleep(1800);
  const running = await checkDaemon();
  updatePort(running);
  ps.unref();
  return typeof running !== "boolean" && running.length ? running : false;
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
  } catch {
    return DaemonPingStatus.ERROR;
  }
}

export default async function greetDaemon() {
  /**
   * check daemon service has been running or not
   */
  let daemonHasRunning = await checkDaemon();

  /**
   * if it is not running,
   * start it
   */
  if (!daemonHasRunning) {
    daemonHasRunning = await startDaemon();
    return {
      tell,
      daemonInfo: daemonHasRunning || null,
    };
  }

  /**
   * if pid or port is unavailable,
   * start it
   */
  const { pid, port } = daemonHasRunning[0];
  if (!pid || !port) {
    daemonHasRunning = await startDaemon();
    return {
      tell,
      daemonInfo: daemonHasRunning,
    };
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
    return {
      tell,
      daemonInfo: daemonHasRunning,
    };
  }

  /**
   * if pong response is OUTDATED,
   * may be your local-cli or daemon of pmb is outdated
   */
  if (pong === DaemonPingStatus.OUTDATED) {
    const { t } = await useI18n();
    L.warn(`${t("exception.OUTDATED")}\n`);
    return {
      tell,
      daemonInfo: daemonHasRunning,
    };
  }

  return {
    tell,
    daemonInfo: daemonHasRunning,
  };
}
