import colors from "colors";
import figlet from "figlet";
import EasyTable from "easy-table";
import pkg from "../../../package.json";
import { customAlphabet } from "nanoid";
import { BunProcessStatus, BunProcessStatusColor } from "../const";
import type { BunProcess } from "../../service/src/runtime/bun-process";
import type { IBunProcessVO } from "./types";

export const nanoid = customAlphabet(
  "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM",
  6
);

type Color =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "grey"
  | "reset"
  | "bold"
  | "dim"
  | "italic"
  | "underline"
  | "inverse"
  | "hidden"
  | "strikethrough"
  | "rainbow"
  | "zebra"
  | "america"
  | "trap"
  | "random"
  | "zalgo";

type BgColor =
  | "bgBlack"
  | "bgRed"
  | "bgGreen"
  | "bgYellow"
  | "bgBlue"
  | "bgMagenta"
  | "bgCyan"
  | "bgWhite";

export function isSame(a: any[], b: any[]) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

export function singleton<T, D extends new (...args: any) => T>(className: D) {
  let instance: T;
  let params: any[] = [];
  return function (...args: any) {
    if (!instance) {
      instance = new className(...args);
      params = args;
      return instance;
    }
    if (isSame(params, args)) {
      return instance;
    } else {
      throw Error(`can not create instance from new ${className.name}`);
    }
  } as unknown as D;
}

export function firstLocaleUpperCase(word: string) {
  const lowerCase = word.trim().toLocaleLowerCase();
  return lowerCase.replace(lowerCase[0], lowerCase[0].toUpperCase());
}

export function intlTimeFormat(date?: Date | number, lang = "zh-CN") {
  return new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).format(date);
}

export function bunProcessToVO(pc: BunProcess) {
  const startTime = pc.startTimes.at(-1);
  return {
    name: pc.name,
    pid: pc.pid,
    starter: pc.starter,
    entry: pc.entryFile,
    status: BunProcessStatus[pc.status],
    startTime: startTime ? intlTimeFormat(new Date(startTime)) : "-",
  } as IBunProcessVO;
}

export function bunProcessVOToTable(
  pc: IBunProcessVO,
  prototypeColor?: Record<string, string>
) {
  return Object.assign(
    Object.create({
      ...prototypeColor,
      __statusColor: BunProcessStatusColor[pc.status],
    }),
    {
      name: pc.name,
      pid: pc.pid,
      starter: pc.starter,
      entry: pc.entry,
      status: pc.status,
      startTime: pc.startTime ? intlTimeFormat(new Date(pc.startTime)) : "-",
    }
  ) as IBunProcessVO;
}

export class L {
  static success(...args: any) {
    const tag = colors.bgGreen(" SUCCESS ");
    return console.log(tag, ...args.map((e: any) => colors.green(e)));
  }

  static warn(...args: any) {
    const tag = colors.bgYellow(" WARNING ");
    return console.log(tag, ...args.map((e: any) => colors.yellow(e)));
  }

  static color(
    contents: string[],
    cs: (Color | BgColor | undefined | null)[] = [],
    bcs: (BgColor | Omit<Color, "gray" | "grey"> | undefined | null)[] = []
  ) {
    return console.log(
      ...contents.map((e, i) => {
        let item = e;
        if (cs[i]) {
          const key = cs[i]!.startsWith("bg")
            ? cs[i]!
            : cs[i]!.toLocaleLowerCase();
          item = key in colors ? colors[key](item) : item;
        }
        if (bcs[i]) {
          const key = (
            bcs[i]!.startsWith("bg")
              ? bcs[i]!
              : `bg${firstLocaleUpperCase(bcs[i] as string)}`
          ) as string;
          item = key in colors ? colors[key](item) : item;
        }
        return item;
      })
    );
  }

  static Logo() {
    L.color(
      [
        figlet.textSync("PMB"),
        "\n P(rocess) M(anager) for B(un)",
        ` v${pkg.version} `,
        "\n---------------------------------------",
        "\n",
      ],
      ["green", "cyan", "italic", "cyan"],
      [, , "bgCyan"]
    );
  }

  static table<T extends Record<string, any>>(
    data: T[],
    emptyPlaceholder = "No data"
  ) {
    if (data.length === 0) {
      L.color([` ${emptyPlaceholder}\n\n`], ["gray"]);
      return;
    }
    const t = new EasyTable();
    data.forEach((item) => {
      Object.getOwnPropertyNames(item).forEach((k) => {
        let value = item[k];
        const colorKey = item[`__${k}Color`];
        if (colorKey in colors) {
          value = colors[colorKey](value);
        }
        t.cell(k, value);
      });
      t.newRow();
    });
    console.log(t.toString());
  }
}