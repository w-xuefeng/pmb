import { Hono } from "hono";
import { serveStatic } from "hono/serve-static.bun";
import pkg from "../../../package.json";

const port = parseInt(process.env.PORT) || 9501;
const app = new Hono();
app.use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));
app.get("/", (c) => {
  return c.json({ message: "Hello World!" });
});
app.get("/ping", (c) => {
  if (c.req.headers.get("x-action") !== "ping") {
    return c.text("null");
  }
  if (pkg.version !== c.req.headers.get("x-version")) {
    return c.text("outdated");
  }
  return c.text("pong");
});
function startService() {
  return Bun.serve({
    port,
    fetch: app.fetch,
  });
}

export default startService;
