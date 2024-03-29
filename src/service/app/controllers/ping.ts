import pkg from "../../../../package.json";
import type { Context } from "hono";

export default function ping(c: Context) {
  if (c.req.raw.headers.get("x-action") !== "ping") {
    return c.text("null");
  }
  if (pkg.version !== c.req.raw.headers.get("x-version")) {
    return c.text("outdated");
  }
  return c.text("pong");
}
