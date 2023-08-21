import type { Context } from "hono";
import { BunProcess } from "../runtime/bun-process";

export default async function start(c: Context) {
  if (!c.req.body) {
    return c.json({ data: [] });
  }
  const body = await new Response(c.req.body).json();
  const { name, entry, starter } = body;

  const p = new BunProcess(name, entry, starter);
  await p.start();

  return c.json({
    data: [p.toVO()],
  });
}
