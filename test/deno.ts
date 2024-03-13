const port = 3002;
// @ts-ignore
Deno.serve({ port, handler: () => new Response("Deno!") });

console.log("Deno: ", `Listening on http://localhost:${port}...`);
