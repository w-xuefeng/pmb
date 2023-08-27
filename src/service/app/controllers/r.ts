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
}

export async function bodyCheck(c: Context) {
  if (!c.req.body) {
    const { t } = await useI18n();
    return {
      hasBody: false,
      res: c.json(R.fail(HTTP_CODE.MISSING_BODY, t("exception.MISSING_BODY"))),
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
