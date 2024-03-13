import { getCommand } from "../const/commands";
import daemonStarter from "./daemon-starter";

/**
 * restart daemon in the new process
 */

try {
  const pid = process.argv.slice(2)[0];
  Bun.spawnSync(getCommand('taskkill', `${pid}`));
  const ps = await daemonStarter();
  ps.unref();
} catch (error) {
  console.log("daemon-auto-restart-error:");
  console.log(error);
}
