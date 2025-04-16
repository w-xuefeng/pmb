import R from "./r";
import { useI18n } from "../../../i18n";
import { Setting } from "../../../shared/utils/setting";
import { SERVICE_PATH } from "../../../shared/const/service-path";
import type { Context } from "hono";

const servicePaths = Object.fromEntries(
  ["LIST", "START", "RESTART", "STOP", "REMOVE", "LS", "AUTH"].map((e) => [
    e,
    SERVICE_PATH[e],
  ])
);

export default async function UIConfig(c: Context) {
  const { type } = c.req.query();
  const { t } = await useI18n();
  const password = await Setting.getSetting("ui.password", "");

  const data = {
    lang: t("ui"),
    cwd: process.cwd(),
    secret: !!password.trim(),
    servicePaths,
  };
  if (type === "script") {
    /**
     * check customer ui password setting
     */
    const jsFile = `window.__$GLOBAL_UI_CONFIG = ${JSON.stringify(data)};`;
    const jsContent = `
/**
 * config
 */
function getConfig(key = "") {
  return key
    ? key in window.__$GLOBAL_UI_CONFIG
      ? window.__$GLOBAL_UI_CONFIG[key]
      : void 0
    : window.__$GLOBAL_UI_CONFIG;
}
function getLang(key = "", defaultValue = "") {
  const langConf = getConfig("lang");
  return key
    ? key in langConf
      ? langConf[key] ?? defaultValue
      : defaultValue
    : langConf;
}
function displayLang(parent = document) {
  const lang = getLang();
  Object.keys(lang).forEach((k) => {
    const dom = parent.querySelector("[data-lang-key=" + k + "]");
    if (dom) {
      dom.innerText = lang[k];
    }
    const placeholderDom = parent.querySelector(
      "[data-lang-placeholder-key="+ k + "]"
    );
    if (placeholderDom) {
      placeholderDom.placeholder = lang[k] + '...';
    }
  });
}
const SERVICE_PATH = getConfig("servicePaths");
`;
    return R.js([jsFile, jsContent], c);
  }
  return c.json(R.ok(data));
}
