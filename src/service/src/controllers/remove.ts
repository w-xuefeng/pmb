import type { Context } from "hono";

export default function remove(c: Context) {
  return c.json({ data: [] });
}
