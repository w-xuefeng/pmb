import startService from "../../service/app";
import { createPathSync } from "../../shared/utils/file";
import { DAEMON_PID_PATH } from "../../shared/const";

(async function main() {
  const server = await startService();
  const pid = process.pid;
  const port = server.port;
  createPathSync("file", DAEMON_PID_PATH, `${pid}|${port}`);
  console.log(`Daemon service start successfully on port [${port}]\n`);
})();
