import R, { bodyCheck } from "./r";
import { setCurrentLang } from "../../../langs/i18n";
import type { Context } from "hono";

export default async function setLang(c: Context) {
  const { hasBody, res } = bodyCheck(c);
  if (!hasBody) {
    return res;
  }
  const body = await res.json();
  const { lang } = body;
  const value = lang?.startsWith("zh") ? "zhCN" : "enUS";
  await setCurrentLang(value);
  return c.json(R.ok(value));
}
