export interface IBunProcessVO {
  name: string;
  pid: string;
  starter: string;
  entry: string;
  status: string;
  startTime: string;
  restRestartCount: number | string;
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
