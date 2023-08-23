import { createServer } from "http";

const port = 3001;
createServer((_, res) => res.end("Node!\n")).listen(port);

console.log("Node: ", `Listening on http://localhost:${port}...`);
