const server = Bun.serve({
  port: 3000,
  fetch: () => new Response(`Bun!`),
});

console.log("Bun: ", `Listening on http://localhost:${server.port}...`);
