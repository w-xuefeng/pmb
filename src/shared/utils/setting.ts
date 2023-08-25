import { deepGet } from ".";
import { CUSTOM_SETTING_PATH } from "../const";
import { createPathSync } from "./file";
import type { DeepKeyOf } from "./types";

/**
 * customer setting
 */
export interface ISetting {
  ui: {
    enable: boolean;
  };
}

/**
 * default customer setting
 */
export function getDefaultSetting(): ISetting {
  return {
    ui: {
      enable: true,
    },
  };
}

export class Setting {
  static async getSetting(path?: DeepKeyOf<ISetting>, defaultValue?: any) {
    const settingFile = Bun.file(CUSTOM_SETTING_PATH);
    const exists = await settingFile.exists();
    let setting = getDefaultSetting();
    if (!exists) {
      createPathSync(
        "file",
        CUSTOM_SETTING_PATH,
        JSON.stringify(setting, null, 2)
      );
    } else {
      setting = await settingFile.json();
    }
    return deepGet(setting, path, defaultValue);
  }

  static async setSetting(
    key: keyof ISetting,
    value: Partial<ISetting[keyof ISetting]>
  ) {
    const setting = await this.getSetting();
    if (typeof setting[key] === "object") {
      setting[key] = {
        ...setting[key],
        ...value,
      };
    } else {
      setting[key] = value;
    }
    await Bun.write(CUSTOM_SETTING_PATH, JSON.stringify(setting, null, 2));
  }
}
