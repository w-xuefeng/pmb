import colors from "colors";
import { customAlphabet } from "nanoid";

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
}
