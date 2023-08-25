import list from "./list";
import { bodyCheck } from "./r";
import { BunProcessRuntime } from "../runtime/runtime";
import type { Context } from "hono";

export default async function restart(c: Context) {
  const { hasBody, res } = await bodyCheck(c);
  if (!hasBody) {
    return res;
  }
  const body = await res.json();
  const { name, pid } = body;
  if (name) {
    await BunProcessRuntime.tryReStartByName(name, true);
  } else if (pid) {
    await BunProcessRuntime.tryReStartByPid(Number(pid), true);
  }
  return list(c);
}
