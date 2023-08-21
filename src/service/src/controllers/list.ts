import type { Context } from "hono";
import { BunProcessRuntime } from "../runtime/runtime";
import { bunProcessToVO } from "../../../shared/utils";
import type { BunProcess } from "../runtime/bun-process";

export default async function list(c: Context) {
  const query = c.req.query();
  let list = await BunProcessRuntime.getProcesses();

  const statusFilter = (p: BunProcess) =>
    query.status ? Object.is(Number(query.status), Number(p.status)) : true;

  if (query.name) {
    list = list.filter(([name, p]) => statusFilter(p) && name === query.name);
  }

  if (query.pid) {
    list = list.filter(
      ([_, p]) => statusFilter(p) && Object.is(Number(p.pid), Number(query.pid))
    );
  }

  const data = list.map(([_, e]) => bunProcessToVO(e));

  return c.json({ data });
}
