import startService from "../../service/app";
import { DAEMON_PID_PATH } from "../const";
import { createPathSync } from "../utils/file";

(async function main() {
  const server = await startService();
  const pid = process.pid;
  const port = server.port;
  const time = Date.now();
  createPathSync("file", DAEMON_PID_PATH, `${pid}|${port}|${time}`);
  console.log(`Daemon service start successfully on port [${port}]\n`);
})();
