export interface IBunProcessVO {
  name: string;
  pid: string;
  starter: string;
  entry: string;
  status: string;
  startTime: string;
  restRestartCount: number | string;
  cwd: string;
}

export type DeepKeyOf<T> = T extends Record<string, any>
  ? {
      [k in keyof T]: k extends string
        ? T[k] extends Array<any>
          ? k
          : k | `${k}.${DeepKeyOf<T[k]>}`
        : never;
    }[keyof T]
  : never;

export type DeepValueOf<
  T,
  K extends DeepKeyOf<T> | undefined = undefined
> = T extends Record<string, any>
  ? K extends undefined
    ? T
    : K extends keyof T
    ? T[K]
    : K extends `${infer A}.${infer B}`
    ? B extends DeepKeyOf<T[A]>
      ? DeepValueOf<T[A], B>
      : never
    : never
  : never;
