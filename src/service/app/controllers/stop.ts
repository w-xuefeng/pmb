import list from "./list";
import { bodyCheck } from "./r";
import { BunProcessRuntime } from "../runtime/runtime";
import type { Context } from "hono";

export default async function stop(c: Context) {
  const { hasBody, res } = await bodyCheck(c);
  if (!hasBody) {
    return res;
  }
  const body = await res.json();
  const { name, pid } = body;

  if (name) {
    await BunProcessRuntime.stopByName(name);
  } else if (pid) {
    await BunProcessRuntime.stopByPid(Number(pid));
  }

  return list(c);
}
