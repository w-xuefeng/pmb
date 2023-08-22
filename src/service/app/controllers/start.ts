import { resolve } from "path";
import { BunProcess } from "../runtime/bun-process";
import type { Context } from "hono";

export default async function start(c: Context) {
  if (!c.req.body) {
    return c.json({ data: [] });
  }
  const body = await new Response(c.req.body).json();
  const { name, entry, cwd, starter, restart } = body;

  const entryBunfFile = Bun.file(resolve(cwd, entry));
  const entryBunfFileExists = await entryBunfFile.exists();
  if (!entryBunfFileExists) {
    return c.json({
      success: false,
      message: "entry file not exists",
      code: 1001,
      data: [],
    });
  }

  const p = new BunProcess(name, entry, starter, restart, cwd);
  await p.start();

  return c.json({
    success: true,
    message: "success",
    code: 200,
    data: [p.toVO()],
  });
}
