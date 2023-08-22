import ping from "../controllers/ping";
import list from "../controllers/list";
import start from "../controllers/start";
import stop from "../controllers/stop";
import remove from "../controllers/remove";
import { serveStatic } from "hono/bun";
import { SERVICE_PATH } from "../../../shared/const/service-path";
import type { Hono } from "hono";

export function useRouters(app: Hono) {
  app.get(SERVICE_PATH.PING, ping);
  app.get(SERVICE_PATH.LIST, list);
  app.post(SERVICE_PATH.START, start);
  app.post(SERVICE_PATH.STOP, stop);
  app.post(SERVICE_PATH.REMOVE, remove);
  app.use("/*", serveStatic({ root: "app/pages" }));
}
