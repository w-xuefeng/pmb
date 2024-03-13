import { Hono } from "hono";
import { startHeartbeatCheck } from "./runtime/schedule";
import { useRouters } from "./routers";

const port = 9501;
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
