import ping from "../controllers/ping";
import list from "../controllers/list";
import log from "../controllers/log";
import start from "../controllers/start";
import restart from "../controllers/restart";
import stop from "../controllers/stop";
import remove from "../controllers/remove";
import setLang from "../controllers/lang";
import { serveStatic } from "hono/bun";
import { useI18n } from "../../../langs/i18n";
import { Setting } from "../../../shared/utils/setting";
import { SERVICE_PATH } from "../../../shared/const/service-path";
import type { Hono } from "hono";

export async function useRouters(app: Hono) {
  app.get(SERVICE_PATH.PING, ping);
  app.get(SERVICE_PATH.LIST, list);
  app.get(SERVICE_PATH.LOG, log);
  app.post(SERVICE_PATH.START, start);
  app.post(SERVICE_PATH.RESTART, restart);
  app.post(SERVICE_PATH.STOP, stop);
  app.post(SERVICE_PATH.REMOVE, remove);
  app.post(SERVICE_PATH.SETLANG, setLang);
  app.use("/*", async (c, next) => {
    /**
     * check customer ui enable setting
     */
    const enableUI = await Setting.getSetting("ui.enable", true);
    const { t } = await useI18n();
    return enableUI
      ? await serveStatic({ root: "app/pages" })(c, next)
      : new Response(t("exception.NOT_ENABLED"));
  });
}
