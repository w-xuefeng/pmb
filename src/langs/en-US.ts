export default {
  cli: {
    pmb: {
      description: "Guarding the best processes in the world 💪",
    },
    start: {
      description: "Start a service from the entry file",
    },
    restart: {
      description: "Restart a service from the name or pid",
    },
    stop: {
      description: "Stop a service from the pid or name",
    },
    rm: {
      description: "Stop and remove a service from the pid or name",
    },
    ls: {
      description: "Show list of service started by pmb",
    },
    daemon: {
      description: "Manage daemon process",
    },
    ui: {
      description: "Show list of service started by pmb in browser",
    },
    lang: {
      description: "Switch display language",
      set: "Current display language is [en-US]",
    },
  },
  process: {
    name: "name",
    pid: "pid",
    starter: "starter",
    entry: "entry",
    status: "status",
    startTime: "startTime",
    restRestartCount: "restRestartCount",
    listEmpty: "No process running by pmb",
  },
};
