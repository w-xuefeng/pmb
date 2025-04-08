// import cluster from "cluster";
// import { getCommand } from "../const/commands";
// import { useLogger } from ".";
// import { removeRecordFromDaemon } from "../daemon/daemon-handle";
// import { resolve } from "path";

// export class ClusterManage {
//   static killWorkerByPID(pid: number | string) {
//     const c = getCommand("taskkill", `${pid}`);
//     Bun.spawnSync(c.command);
//   }
// }

// export function workerKiller(pid: number) {
//   if (!cluster.isPrimary) {
//     return;
//   }
//   if (!cluster.workers) {
//     return;
//   }
//   const workers = Object.values(cluster.workers);
//   const worker = workers.find((worker) => worker?.process.pid === pid);
//   if (!worker) {
//     return;
//   }
//   if (worker.isDead()) {
//     return;
//   }
//   const Logger = useLogger("daemon worker killer");
//   worker.kill();
//   removeRecordFromDaemon("worker", pid);
//   Logger(`Daemon process [${pid}] killed!`);
//   setTimeout(() => {
//     /**
//      * ensure kill the worker
//      */
//     if (!worker.isDead()) {
//       ClusterManage.killWorkerByPID(pid);
//     }
//   }, 1000);
// }

// export function restartDaemon() {
//   Bun.spawn({
//     cmd: [
//       "bun",
//       resolve(import.meta.dir, "../daemon/daemon-restarter.ts"),
//       `${process.pid}`,
//     ],
//     stdout: "inherit",
//   }).unref();
// }
