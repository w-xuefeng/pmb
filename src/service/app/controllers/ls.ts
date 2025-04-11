import R, { bodyCheck } from "./r";
import type { Context } from "hono";
import lsRemote from "remote-directory-services";

export default async function ls(c: Context) {
  let path: string = "/";
  const { hasBody, res } = await bodyCheck(c);
  if (hasBody) {
    const body = await res.json();
    path = body.path || path;
  }
  const rs = await lsRemote(path);
  return c.json(R.ok(rs.filter((e) => !e.error)));
}
