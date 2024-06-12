import R from "./r";
import { useI18n } from "../../../i18n";
import type { Context } from "hono";

export default async function UIConfig(c: Context) {
  const { type } = c.req.query();
  const { t } = await useI18n();
  const data = {
    lang: t('ui'),
    cwd: process.cwd()
  }
  if (type === 'script') {
    const rsType = 'application/javascript';
    const jsFile = `window.__$GLOBAL_UI_CONFIG = ${JSON.stringify(data)}`;
    const content = await new Blob([jsFile], { type: rsType }).arrayBuffer();
    return c.newResponse(content, 200, { 'content-type': `${rsType};charset=utf-8;` });
  }
  return c.json(R.ok(data));
}
