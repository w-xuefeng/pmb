import { deepGet } from ".";
import { CUSTOM_SETTING_PATH } from "../const";
import { createPathSync } from "./file";
import type { DeepKeyOf, DeepValueOf } from "./types";

/**
 * customer setting
 */
export interface ISetting {
  /**
   * web ui
   */
  ui: {
    enable: boolean;
  };
  /**
   * process status polling by daemon
   */
  polling: {
    interval: number;
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
    polling: {
      interval: 10 * 1000,
    },
  };
}

export class Setting {
  static async getSetting<
    K extends DeepKeyOf<ISetting> | undefined,
    V = DeepValueOf<ISetting, K>
  >(path?: K, defaultValue?: V) {
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
    return deepGet<ISetting, K, V>(
      setting,
      path,
      defaultValue
    ) as K extends undefined ? ISetting : V;
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
