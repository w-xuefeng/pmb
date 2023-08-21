import { Hono } from "hono";
import { startHeadrCheck } from "./runtime/schedule";
import { useRouters } from "./routers";

const port = 9501;
const app = new Hono();
useRouters(app);

function startService() {
  const server = Bun.serve({
    port,
    fetch: app.fetch,
  });
  startHeadrCheck();
  return server;
}

export default startService;
