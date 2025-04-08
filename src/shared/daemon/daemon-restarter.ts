import { getCommand } from "../const/commands";
import { useLogger } from "../utils";
import { removeDaemonFile } from "./daemon-handle";
import daemonStarter from "./daemon-starter";

/**
 * restart daemon in the new process
 */
const Logger = useLogger("daemon auto restart");
try {
  const pid = process.argv.slice(2)[0];
  const c = getCommand("taskkill", `${pid}`);
  Bun.spawnSync(c.command);
  await removeDaemonFile();
  const ps = await daemonStarter();
  ps.unref();
} catch (error) {
  Logger("daemon-auto-restart-error:");
  console.log(error);
}
