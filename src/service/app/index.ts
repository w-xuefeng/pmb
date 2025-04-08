import { Hono } from "hono";
import { startHeartbeatCheck } from "./runtime/schedule";
import { DEFAULT_DAEMON_PORT } from "../../shared/const";
import { useRouters } from "./routers";

const port = DEFAULT_DAEMON_PORT;
const app = new Hono();
useRouters(app);

async function startService() {
  const server = Bun.serve({
    port,
    fetch: app.fetch,
  });
  await startHeartbeatCheck();
  return server;
}

export default startService;
