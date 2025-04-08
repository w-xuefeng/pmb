// import cluster, { Worker } from "cluster";
// import { useLogger } from ".";
// import { workerKiller } from "./cluster";

// const Logger = useLogger("daemon worker events");

// export const EVENT = {
//   KILL_WORKER: "kill-worker",
// };

// const eventMap = {
//   [EVENT.KILL_WORKER]: workerKiller,
// };

// const messageHandle = (message: { type: string; args: any; from: number }) => {
//   Logger("primary receive message", JSON.stringify(message));
//   const { type, args, from } = message;
//   const withFromPIDArgs = [
//     ...(args ? (Array.isArray(args) ? args : [args]) : []),
//     from,
//   ];
//   eventMap?.[type]?.apply(null, withFromPIDArgs as any);
// };

// export function registerWorker(worker: Worker) {
//   worker.off("message", messageHandle);
//   worker.on("message", messageHandle);
// }

// export function registerPrimaryEvent() {
//   cluster.on("exit", async (worker) => {
//     Logger(`worker ${worker.process.pid} exited!`);
//   });

//   for (const id in cluster.workers) {
//     const worker = cluster.workers[id];
//     worker && registerWorker(worker);
//   }

//   Logger(`registered`);
//   return function () {
//     for (const id in cluster.workers) {
//       const worker = cluster.workers[id];
//       worker?.off("message", messageHandle);
//     }
//     Logger(`unregistered`);
//   };
// }
