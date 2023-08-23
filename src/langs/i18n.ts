import zhCN from "./zh-CN";
import enUS from "./en-US";
import { LANGUAGE_PATH } from "../shared/const";
import { createPathSync } from "../shared/utils/file";
import type { DeepKeyOf } from "../shared/utils/types";

export const messages = {
  zhCN,
  enUS,
};

export type Langs = keyof typeof messages;

export async function getCurrentLang() {
  const bunFile = Bun.file(LANGUAGE_PATH);
  const exists = await bunFile.exists();
  if (!exists) {
    createPathSync("file", LANGUAGE_PATH, "enUS");
  }
  const lang = (await bunFile.text()) as Langs;
  if (lang.trim() === "zhCN") {
    return "zhCN";
  }
  return "enUS";
}

export async function setCurrentLang(lang: Langs) {
  const bunFile = Bun.file(LANGUAGE_PATH);
  const exists = await bunFile.exists();
  if (!exists) {
    createPathSync("file", LANGUAGE_PATH, lang);
    return;
  }
  await Bun.write(LANGUAGE_PATH, lang);
}

export async function useI18n<EM>(extraMsg?: { zhCN: EM; enUS: EM }) {
  const lang = await getCurrentLang();
  return {
    lang,
    t: function (
      path: DeepKeyOf<typeof zhCN> | DeepKeyOf<typeof enUS> | DeepKeyOf<EM>
    ) {
      const obj = Object.assign(
        {},
        {
          zhCN: Object.assign(messages.zhCN, extraMsg?.zhCN),
          enUS: Object.assign(messages.enUS, extraMsg?.enUS),
        }
      )[lang];
      const pathArray = path.split(".");
      let res: string | Record<string, any> = obj;
      for (let i = 0; i < pathArray.length; i++) {
        if (res?.[pathArray[i]] !== void 0 && res?.[pathArray[i]] !== null) {
          res = res[pathArray[i]];
        } else {
          res = path;
          break;
        }
      }
      return res as string;
    },
  };
}
