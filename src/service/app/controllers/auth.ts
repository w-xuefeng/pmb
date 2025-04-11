import { useHandlePassword } from "../../../shared/utils";
import { Setting } from "../../../shared/utils/setting";
import { bodyCheck } from "./r";
import type { Context } from "hono";

export default async function auth(c: Context) {
  const { hasBody, res } = await bodyCheck(c);
  if (!hasBody) {
    return res;
  }
  const body = (await res.text()).trim();
  const password = (await Setting.getSetting("ui.password", "")).trim();
  const pass = body.replace("password=", "");
  if (password === pass) {
    const { key, handle } = useHandlePassword();
    c.res.headers.set("set-cookie", `${key}=${handle(password)};`);
  }
  return c.redirect("/");
}
