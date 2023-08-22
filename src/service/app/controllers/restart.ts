import { BunProcessRuntime } from "../runtime/runtime";
import list from "./list";
import type { Context } from "hono";

export default async function restart(c: Context) {
  if (!c.req.body) {
    return c.json({ data: [] });
  }
  const body = await new Response(c.req.body).json();
  const { name, pid } = body;
  if (name) {
    await BunProcessRuntime.tryReStartByName(name, true);
  } else if (pid) {
    await BunProcessRuntime.tryReStartByPid(Number(pid), true);
  }
  return list(c);
}
