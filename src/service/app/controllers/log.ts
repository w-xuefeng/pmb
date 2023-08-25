import R, { checkException } from "./r";
import { useI18n } from "../../../langs/i18n";
import { BunProcessRuntime } from "../runtime/runtime";
import type { Context } from "hono";

export default async function log(c: Context) {
  const { name, pid } = c.req.query();
  const { next, res } = await checkException(c, !name && !pid, "MISSING_BODY");
  if (!next) {
    return res;
  }
  const { t } = await useI18n();
  let rs = { status: false, content: t("process.notLog") };
  if (name) {
    rs = await BunProcessRuntime.catLogByName(name);
  } else if (pid) {
    rs = await BunProcessRuntime.catLogByPid(Number(pid));
  }
  return c.json(rs.status ? R.ok(rs.content) : R.fail(-1, rs.content));
}
