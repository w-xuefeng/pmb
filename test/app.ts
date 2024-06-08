const server = Bun.serve({
  port: 3000,
  fetch: (req) => {
    console.log(`[log]: ${req.method} ${req.url}`);
    return new Response(`Bun`);
  },
});

console.log("Bun: ", `Listening on http://localhost:${server.port}...`);
console.log("Args: ", process.argv.slice(2));
