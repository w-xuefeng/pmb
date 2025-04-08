import startService from "../../service/app";
import { DAEMON_PID_PATH } from "../const";
import { createPathSync, appendFile, rmdirSync } from "../utils/file";

import { useLogger } from "../utils";

async function saveDaemonInfo(
  type: "primary" | "worker",
  pid: number = process.pid,
  port?: number
) {
  const time = Date.now();
  const DAEMON_FILE = Bun.file(DAEMON_PID_PATH);
  const exists = await DAEMON_FILE.exists();
  const content = `${type}|${pid}|${port || ""}|${time}\n`;
  if (!exists) {
    createPathSync("file", DAEMON_PID_PATH, content);
  } else {
    const stat = await DAEMON_FILE.stat();
    if (stat.isDirectory()) {
      rmdirSync(DAEMON_PID_PATH);
      createPathSync("file", DAEMON_PID_PATH, content);
    }
    if (stat.isFile()) {
      await appendFile(DAEMON_PID_PATH, content);
    }
  }
}

(async function main() {
  const Logger = useLogger("daemon process");
  const server = await startService();
  const pid = process.pid;
  const port = server.port;
  await saveDaemonInfo("primary", pid, port);
  Logger(
    `Daemon service start successfully on port [${port}], worker pid is [${pid}]`
  );
})();
