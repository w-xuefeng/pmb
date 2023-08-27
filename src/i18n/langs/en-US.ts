export default {
  cli: {
    pmb: {
      description: "Guarding the best processes in the world 💪",
    },
    start: {
      description: "Start a service from the entry file",
      entry: "specify the entry file path for service startup",
      name: "create a name for the service",
      starter: "specify the application to start the service",
    },
    restart: {
      description: "Restart a service from the name or pid",
      nameOrPid: "specify a name or pid to restart the service",
      reset: "reset remaining restarts",
    },
    stop: {
      description: "Stop a service from the pid or name",
      nameOrPid: "specify a name or pid to stop the service",
    },
    rm: {
      description: "Stop and remove a service from the pid or name",
      nameOrPid: "specify a name or pid to stop and remove the service",
    },
    ls: {
      description: "Show list of service started by pmb",
    },
    daemon: {
      description: "Manage daemon process",
      action:
        "action implemented on the daemon, Eg: status, start, stop, restart",
    },
    ui: {
      description: "Show list of service started by pmb in browser",
      enabled: "enabled Web UI",
      disabled: "disabled Web UI",
      visit: "Please visit",
      enabledSuccess: "Web UI has been enabled",
      disabledSuccess: "Web UI has been disabled",
    },
    log: {
      description: "Show log of service from the pid or name",
    },
    lang: {
      description: "Switch display language to 【简体中文】",
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
    notExist: "Process does not exist",
    notLog: "There are currently no logs available",
  },
  exception: {
    ENTRY_NOT_EXISTS: "Entry file not exists",
    MISSING_BODY: "Required parameter missing",
    NOT_ENABLED: "This feature is not enabled",
    OUTDATED:
      "Please upgrade your pmb version or restart daemon via [pmb daemon restart]",
    NAME_EXISTS:
      "A service with the same name [{name}] is already running, entry is [{entry}], pid is [{pid}]",
  },
};
