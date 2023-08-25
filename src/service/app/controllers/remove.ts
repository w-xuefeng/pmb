import list from "./list";
import { BunProcessRuntime } from "../runtime/runtime";
import type { Context } from "hono";
import { bodyCheck } from "./r";

export default async function remove(c: Context) {
  const { hasBody, res } = await bodyCheck(c);
  if (!hasBody) {
    return res;
  }
  const body = await res.json();
  const { name, pid } = body;

  if (name) {
    await BunProcessRuntime.removeProcess(name);
  } else if (pid) {
    await BunProcessRuntime.removeProcessByPid(Number(pid));
  }

  return list(c);
}
