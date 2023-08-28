export default {
  cli: {
    pmb: {
      description: "守护世界上最好的进程 💪",
    },
    start: {
      description: "通过项目入口文件启动一个服务",
      entry: "指定服务启动的入口文件路径",
      name: "为服务创建一个名称",
      starter: "指定启动服务的应用程序",
    },
    restart: {
      description: "通过名称或者PID重启服务",
      nameOrPid: "指定名称或PID来重启服务",
      reset: "重置剩余重启次数",
    },
    stop: {
      description: "通过名称或者PID停止服务",
      nameOrPid: "指定名称或PID来停止服务",
    },
    rm: {
      description: "通过名称或者PID停止并删除服务",
      nameOrPid: "指定名称或PID来停止且删除服务",
    },
    ls: {
      description: "列出通过PMB启动的服务",
    },
    daemon: {
      description: "管理守护进程",
      action:
        "守护进程的操作，例如：status（查看状态）、start（启动）、stop（停止）、restart（重启）",
      hasRunning: "守护进程已在端口【{port}】上运行，PID为【{pid}】!",
      unexpected:
        "守护进程似乎响应了一个不期待的结果！也许可以尝试升级版本或者重启守护进程来解决这个问题.",
      stopException: "守护进程似乎没有正确停止！",
      notRunning: "守护进程尚未运行！",
      started: "守护进程已经成功在端口[{port}]上{type}！",
      start: "启动",
      restart: "重启",
      stopped: "守护进程已经停止！",
      manageTips: "你可以使用 status|start|stop|restart 指令来管理守护进程!",
    },
    ui: {
      description: "在浏览器中列出通过PMB启动的服务",
      enabled: "启用 Web UI 功能",
      disabled: "停用 Web UI 功能",
      visit: "请访问",
      enabledSuccess: "Web UI 功能已启用",
      disabledSuccess: "Web UI 功能已停用",
    },
    log: {
      description: "通过名称或者PID查询服务日志",
    },
    lang: {
      description: "切换展示语言为 【en-US】",
      set: "当前展示语言为【简体中文】",
    },
  },
  process: {
    name: "名称",
    pid: "PID",
    starter: "启动程序",
    entry: "入口文件",
    status: "状态",
    startTime: "启动时间",
    restRestartCount: "剩余重启次数",
    listEmpty: "暂无通过PMB启动的进程",
    notExist: "进程不存在",
    notLog: "暂无日志",
  },
  exception: {
    ENTRY_NOT_EXISTS: "入口文件不存在",
    MISSING_BODY: "缺少必要参数",
    NOT_ENABLED: "未启用该功能",
    OUTDATED: "请升级您的 pmb 版本或通过【pmb daemon restart】重启守护进程",
    NAME_EXISTS:
      "具体相同名称【{name}】的服务已经在运行, 入口文件为【{entry}】, PID为【{pid}】",
  },
};
