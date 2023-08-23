import type { Context } from "hono";
import type { IResponse } from "../../../shared/utils/http";

enum HTTP_CODE {
  ENTRY_NOT_EXISTS = 1001,
  MISSING_BODY = 1004,
}
enum HTTP_MSG {
  ENTRY_NOT_EXISTS = "Entry file not exists",
  MISSING_BODY = "Required parameter missing",
}

export default class R {
  static json<T>(option: IResponse<T>) {
    return option;
  }

  static ok<T>(data: T) {
    return this.json({
      success: true,
      code: 200,
      message: "success",
      data,
    });
  }

  static fail(code: number, message: string) {
    return this.json({
      success: false,
      code,
      message,
      data: null,
    });
  }
}

export function bodyCheck(c: Context) {
  if (!c.req.body) {
    return {
      hasBody: false,
      res: c.json(R.fail(HTTP_CODE.MISSING_BODY, HTTP_MSG.MISSING_BODY)),
    };
  }
  return {
    hasBody: true,
    res: new Response(c.req.body),
  };
}

export async function checkException(
  c: Context,
  judgement: boolean,
  codeMsg: keyof typeof HTTP_CODE
) {
  if (judgement) {
    return {
      next: false,
      res: c.json(R.fail(HTTP_CODE[codeMsg], HTTP_MSG[codeMsg])),
    };
  }
  return {
    next: true,
  };
}
