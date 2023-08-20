import startService from "../../service/src";
import { startHeadrCheck } from "../runtime/schedule";
import { createPathSync } from "../../../utils/file";
import { daemonPidPath } from "../const";

(function main() {
  const server = startService();
  startHeadrCheck();
  const pid = process.pid;
  const port = server.port;
  createPathSync("file", daemonPidPath, `${pid}|${port}`);
  console.log(`Daemon service start successfully on port [${port}]\n`);
})();
