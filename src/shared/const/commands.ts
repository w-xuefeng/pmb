import { OSP } from ".";

type TPID = string | number
type TCommand = string[] | ((...args: any[]) => string[]);

interface ICommands {
  taskkill: TCommand;
  taskInfo: TCommand;
  taskMemCPUInfo: TCommand;
}

const unixTaskKill = ["kill", "-9"];
const windowsTaskKill = ['taskkill', '/F', '/PID'];

const unixTaskInfo = (pid: TPID) => ["ps", "-p", `${pid}`, "-o", "comm="];
const windowsTaskInfo = (pid: TPID) => ["tasklist", "/FI", `"PID eq ${pid}"`, "/FO", "CSV", "/NH"];

const uninxTaskMemCPUInfo = (pid: TPID, type: 'mem' | 'cpu') => ["ps", "-p", `${pid}`, "-o", `%${type}`];
// TODO
const windowsTaskMemCPUInfo = (pid: TPID, type: 'mem' | 'cpu') => ["ps", "-p", `${pid}`, "-o", `%${type}`];

export const commands: Record<NodeJS.Platform, ICommands> = {
  aix: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: uninxTaskMemCPUInfo,
  },
  android: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: uninxTaskMemCPUInfo,
  },
  darwin: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: uninxTaskMemCPUInfo,
  },
  freebsd: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: uninxTaskMemCPUInfo,
  },
  haiku: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: uninxTaskMemCPUInfo,
  },
  linux: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: uninxTaskMemCPUInfo,
  },
  openbsd: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: uninxTaskMemCPUInfo,
  },
  sunos: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: uninxTaskMemCPUInfo,
  },
  win32: {
    taskkill: windowsTaskKill,
    taskInfo: windowsTaskInfo,
    taskMemCPUInfo: windowsTaskMemCPUInfo,
  },
  cygwin: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: uninxTaskMemCPUInfo,
  },
  netbsd: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: uninxTaskMemCPUInfo,
  },
}

export function getCommand(commandType: keyof ICommands, ...args: string[]) {
  const command = commands[OSP][commandType];
  return typeof command === 'function' ? command(...args) : [...command, ...args]
}
