import { DAEMON_PID_PATH, DAEMON_PID_PATH_LOCK } from "../const";

export class DaemonLock {
  static #lock = false;

  static #hasLock() {
    const lock = Bun.file(DAEMON_PID_PATH_LOCK);
    return lock.exists() || this.#lock;
  }

  static #addLock() {
    this.#lock = true;
    return Bun.write(DAEMON_PID_PATH_LOCK, `${process.pid}`);
  }

  static #releaseLock() {
    this.#lock = false;
    return Bun.file(DAEMON_PID_PATH_LOCK).unlink();
  }

  static async run(
    handle: () => Promise<any> | any,
    retryCount = 50,
    interval = 1000
  ) {
    const locked = await this.#hasLock();
    if (!locked) {
      try {
        /**
         * add write-lock
         */
        await this.#addLock();
        await handle();
      } finally {
        /**
         * release write-lock
         */
        await this.#releaseLock();
      }
    } else if (retryCount > 0) {
      setTimeout(() => {
        this.run(handle, retryCount - 1, interval);
      }, interval);
    } else {
      console.log("[DaemonLock runner exhausted]");
    }
  }
}

export async function removeRecordFromDaemon(
  type: "primary" | "worker",
  pid: number
) {
  const DAEMON_FILE = Bun.file(DAEMON_PID_PATH);
  const exists = await DAEMON_FILE.exists();
  if (!exists) {
    return;
  }
  await DaemonLock.run(async () => {
    const text = await DAEMON_FILE.text();
    const lines = text.split("\n");
    const index = lines.findIndex((e) => e.startsWith(`${type}|${pid}`));
    if (index < 0) {
      return;
    }
    lines.splice(index, 1);
    Bun.write(DAEMON_PID_PATH, lines.join("\n"));
  });
}

export async function removeDaemonFile() {
  await DaemonLock.run(async () => {
    const DAEMON_FILE = Bun.file(DAEMON_PID_PATH);
    DAEMON_FILE.exists().then(() => {
      DAEMON_FILE.unlink();
    });
  });
}
