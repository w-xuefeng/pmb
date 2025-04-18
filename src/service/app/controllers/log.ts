import R from "./r";
import { BunProcessRuntime } from "../runtime/runtime";
import type { Context } from "hono";

export default async function log(c: Context) {
  const { name, pid, date } = c.req.query();
  const rs = pid
    ? await BunProcessRuntime.catLogByPid(pid, date)
    : await BunProcessRuntime.catLogByName(name, date);
  return c.json(rs.status ? R.ok(rs.content) : R.fail(-1, rs.content));
}
