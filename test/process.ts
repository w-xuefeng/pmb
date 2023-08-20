// const parse = (content?: string) => {
//   const rs: string[] = [];
//   if (!content) {
//     return;
//   }
//   let index = 0;
//   let nextFlag = false;
//   for (let i = 0; i < content.length; i++) {
//     if (content[i].trim()) {
//       if (nextFlag) {
//         index++;
//         nextFlag = false;
//       }
//       rs[index] = rs[index] ? rs[index] + content[i] : content[i];
//     } else {
//       nextFlag = true;
//     }
//   }

// import { BunProcessRuntime } from "../src/process/runtime/runtime";

//   return rs;
// };

// const combine = (header?: string[], content?: (string[] | undefined)[]) => {
//   if (!header || !content) {
//     return;
//   }
//   return content.map((tr, i) =>
//     tr ? Object.fromEntries(tr.map((td, i) => [header[i], td])) : {}
//   );
// };

// const rs = Bun.spawn({
//   cmd: ["lsof", "-c", "bun"],
// });

// const out = await new Response(rs.stdout).text();
// const table = out
//   .split("\n")
//   .filter((e) => !!e.trim())
//   .map((e) => parse(e));
// const [header, ...content] = table;
// const parsedTable = combine(header, content);

// console.log(parsedTable?.map((e) => e.TYPE));
// console.log(parsedTable?.map((e) => e.PID));
// console.log(parsedTable?.map((e) => e.NODE));

// BunProcessRuntime.checkProcesses();

// BunProcessRuntime.tryReStartByName("OInD4h-app.ts");

export {};
