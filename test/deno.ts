// @ts-ignore
import { Server } from "https://deno.land/std@0.199.0/http/server.ts";

const port = 3002;
new Server({ port, handler: () => new Response("Deno!") }).listenAndServe();

console.log("Deno: ", `Listening on http://localhost:${port}...`);
