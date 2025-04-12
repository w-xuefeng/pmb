import { handleSize } from "../../utils";
import type { ICommands, TCommand, TPID } from "./command-types";
import { getCommandInternal } from "./command-utils";

const unixTaskKill: TCommand = ["kill", "-9"];
const windowsTaskKill: TCommand = ["taskkill", "/F", "/PID"];

const unixTaskInfo: TCommand = (pid: TPID) => [
  "ps",
  "-p",
  `${pid}`,
  "-o",
  "comm=",
];
const windowsTaskInfo: TCommand = (pid: TPID) => [
  "tasklist",
  "/FI",
  `"PID eq ${pid}"`,
  "/FO",
  "CSV",
  "/NH",
];

const unixTaskMemCPUInfo: TCommand = (pid: TPID, type: "mem" | "cpu") => {
  if (type === "cpu") {
    return {
      command: ["ps", "-p", `${pid}`, "-o", "%cpu="],
      parseOutput: (output: string) => {
        return `${output.trim()}%`;
      },
    };
  }
  if (type === "mem") {
    return {
      command: ["ps", "-p", `${pid}`, "-o", "rss="],
      parseOutput: (output: string) => {
        return handleSize(parseFloat(output.trim()) * 1000);
      },
    };
  }
  return [];
};

const windowsTaskMemCPUInfo: TCommand = (pid: TPID, type: "mem" | "cpu") => {
  if (type === "cpu") {
    return {
      command: [
        "wmic",
        "path",
        "Win32_PerfFormattedData_PerfProc_Process",
        "where",
        `IDProcess=${pid}`,
        "get",
        "PercentProcessorTime",
        "/FORMAT:VALUE",
      ],
      parseOutput: (output: string) => {
        const lines = output.trim().split("\n");
        const result = lines[lines.length - 1].split("=")[1].trim();
        return `${result}%`;
      },
    };
  }
  if (type === "mem") {
    return {
      command: [
        "wmic",
        "process",
        "where",
        `ProcessId=${pid}`,
        "get",
        "WorkingSetSize",
        "/FORMAT:VALUE",
      ],
      parseOutput: (output: string) => {
        const lines = output.trim().split("\n");
        const result = lines[lines.length - 1].split("=")[1].trim();
        return handleSize(parseFloat(result.trim()) * 1000);
      },
    };
  }
  return [];
};

export const commands: Record<NodeJS.Platform, ICommands> = {
  aix: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: unixTaskMemCPUInfo,
  },
  android: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: unixTaskMemCPUInfo,
  },
  darwin: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: unixTaskMemCPUInfo,
  },
  freebsd: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: unixTaskMemCPUInfo,
  },
  haiku: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: unixTaskMemCPUInfo,
  },
  linux: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: unixTaskMemCPUInfo,
  },
  openbsd: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: unixTaskMemCPUInfo,
  },
  sunos: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: unixTaskMemCPUInfo,
  },
  win32: {
    taskkill: windowsTaskKill,
    taskInfo: windowsTaskInfo,
    taskMemCPUInfo: windowsTaskMemCPUInfo,
  },
  cygwin: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: unixTaskMemCPUInfo,
  },
  netbsd: {
    taskkill: unixTaskKill,
    taskInfo: unixTaskInfo,
    taskMemCPUInfo: unixTaskMemCPUInfo,
  },
};

export function getCommand(commandType: keyof ICommands, ...args: string[]) {
  return getCommandInternal(commands, commandType, ...args);
}
