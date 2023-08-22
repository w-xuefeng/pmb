import list from "./list";
import { BunProcessRuntime } from "../runtime/runtime";
import type { Context } from "hono";

export default async function stop(c: Context) {
  if (!c.req.body) {
    return c.json({ data: [] });
  }
  const body = await new Response(c.req.body).json();
  const { name, pid } = body;

  if (name) {
    await BunProcessRuntime.stopByName(name);
  } else if (pid) {
    await BunProcessRuntime.stopByPid(Number(pid));
  }

  return list(c);
}