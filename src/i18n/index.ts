import zhCN from "./langs/zh-CN";
import enUS from "./langs/en-US";
import { peek } from "bun";
import { deepGet } from "../shared/utils";
import { LANGUAGE_PATH } from "../shared/const";
import { createPathSync } from "../shared/utils/file";
import type { DeepKeyOf } from "../shared/utils/types";

export const messages = {
  zhCN,
  enUS,
};

export type Langs = keyof typeof messages;

export type ExtraMessage<T> = {
  [k in Langs]: T;
};

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

export function i18n<EM>(lang: Langs, extraMsg?: ExtraMessage<EM>) {
  return {
    lang,
    t: function (
      path: DeepKeyOf<typeof zhCN> | DeepKeyOf<typeof enUS> | DeepKeyOf<EM>,
      replacer?: Record<string, any>
    ) {
      const obj = Object.assign(
        {},
        {
          zhCN: Object.assign(messages.zhCN, extraMsg?.zhCN),
          enUS: Object.assign(messages.enUS, extraMsg?.enUS),
        }
      )[lang];
      let value = deepGet(obj, path as DeepKeyOf<typeof obj>, path) as string;
      if (replacer && value) {
        Object.keys(replacer).forEach((k) => {
          if (value.includes(`{${k}}`)) {
            value = value.replace(`{${k}}`, replacer[k]);
          }
        });
      }
      return value;
    },
  };
}

export async function useI18n<EM>(extraMsg?: ExtraMessage<EM>) {
  const lang = await getCurrentLang();
  return i18n(lang, extraMsg);
}

export function useI18nSync<EM>(
  defaultLangs: Langs = "enUS",
  extraMsg?: ExtraMessage<EM>
) {
  const lang = peek(getCurrentLang());
  return i18n(typeof lang === "string" ? lang : defaultLangs, extraMsg);
}
