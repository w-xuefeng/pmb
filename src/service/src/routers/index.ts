import ping from "../controllers/ping";
import { serveStatic } from "hono/bun";
import { SERVICE_PATH } from "../../../shared/const/service-path";
import type { Hono } from "hono";
import list from "../controllers/list";
import start from "../controllers/start";
import stop from "../controllers/stop";
import remove from "../controllers/remove";

export function useRouters(app: Hono) {
  app.use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));
  app.get("/", (c) => {
    return c.json({ message: "Hello World!" });
  });

  app.get(SERVICE_PATH.LIST, list);
  app.post(SERVICE_PATH.START, start);
  app.post(SERVICE_PATH.STOP, stop);
  app.post(SERVICE_PATH.REMOVE, remove);

  app.get("/ping", ping);
}
