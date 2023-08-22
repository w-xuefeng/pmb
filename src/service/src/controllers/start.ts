import { BunProcess } from "../runtime/bun-process";
import type { Context } from "hono";

export default async function start(c: Context) {
  if (!c.req.body) {
    return c.json({ data: [] });
  }
  const body = await new Response(c.req.body).json();
  const { name, entry, starter, restart } = body;

  const p = new BunProcess(name, entry, starter, restart);
  await p.start();

  return c.json({
    data: [p.toVO()],
  });
}
