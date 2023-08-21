import startService from "../../service/src";
import { createPathSync } from "../../shared/utils/file";
import { DAEMON_PID_PATH } from "../../shared/const";

(function main() {
  const server = startService();
  const pid = process.pid;
  const port = server.port;
  createPathSync("file", DAEMON_PID_PATH, `${pid}|${port}`);
  console.log(`Daemon service start successfully on port [${port}]\n`);
})();
