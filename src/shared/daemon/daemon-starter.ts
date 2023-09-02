import { resolve } from "path";
import { DAEMON_LOG_PATH, SERVICE_ROOT_DIR } from "../const";
import { createPathSync } from "../utils/file";

export default async function daemonStarter() {
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
  return ps;
}
