import R, { bodyCheck, checkException } from "./r";
import { resolve } from "path";
import { BunProcess } from "../runtime/bun-process";
import type { Context } from "hono";

export default async function start(c: Context) {
  const { hasBody, res } = await bodyCheck(c);
  if (!hasBody) {
    return res;
  }
  const body = await res.json();
  const { name, entry, cwd, starter, restart } = body;

  const entryBunfFile = Bun.file(resolve(cwd, entry));
  const entryBunfFileExists = await entryBunfFile.exists();

  const { next, res: exception } = await checkException(
    c,
    !entryBunfFileExists,
    "ENTRY_NOT_EXISTS"
  );

  if (!next && exception) {
    return exception;
  }

  const p = new BunProcess(name, entry, starter, restart, cwd);
  await p.start();

  return c.json(R.ok([p.toVO()]));
}
