import { serveStatic } from "hono/bun";
import { getCookie, useHandlePassword } from "../../../shared/utils";
import { Setting } from "../../../shared/utils/setting";
import path from "node:path";
import type { Context } from "hono";

export default async function uiPages(c: Context) {
  const ext = path.extname(c.req.path);
  const pageRequest = !ext || ["html"].includes(ext);
  const pageRoot = "app/pages/index";
  if (!pageRequest) {
    return serveStatic({ root: pageRoot });
  }

  /**
   * check customer ui enable setting
   */
  const password = String(await Setting.getSetting("ui.password", "")).trim();
  if (!password) {
    return serveStatic({ root: pageRoot });
  }
  const pageInterrupt = "app/pages/interrupt";
  const cookie = getCookie(c);
  const { key, handle } = useHandlePassword();
  const pass = cookie[key];
  if (!pass || handle(password) !== pass) {
    return serveStatic({ root: pageInterrupt });
  }

  return serveStatic({ root: pageRoot });
}
