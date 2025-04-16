import { useI18n } from "../../../i18n";
import type { Context } from "hono";
import type { IResponse } from "../../../shared/utils/http";

export enum HTTP_CODE {
  ENTRY_NOT_EXISTS = 1001,
  MISSING_BODY = 1004,
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

  static async file(file: Blob, c: Context) {
    const content = await file.arrayBuffer();
    return c.newResponse(content, 200, {
      "content-type": `${file.type};charset=utf-8;`,
    });
  }

  static js(jsContent: string | string[], c: Context) {
    return this.file(
      new Blob(Array.isArray(jsContent) ? jsContent : [jsContent], {
        type: "application/javascript",
      }),
      c
    );
  }
}

export async function bodyCheck(c: Context) {
  if (!c.req.raw.body) {
    const { t } = await useI18n();
    return {
      hasBody: false,
      res: c.json(R.fail(HTTP_CODE.MISSING_BODY, t("exception.MISSING_BODY"))),
    };
  }
  return {
    hasBody: true,
    res: new Response(c.req.raw.body),
  };
}

export async function checkException(
  c: Context,
  judgement: boolean,
  codeMsg: keyof typeof HTTP_CODE
) {
  if (judgement) {
    const { t } = await useI18n();
    return {
      next: false,
      res: c.json(R.fail(HTTP_CODE[codeMsg], t(`exception.${codeMsg}`))),
    };
  }
  return {
    next: true,
  };
}
