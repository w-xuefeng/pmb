export default {
  cli: {
    pmb: {
      description: "守护世界上最好的进程 💪",
    },
    start: {
      description: "通过项目入口文件启动一个服务",
    },
    restart: {
      description: "通过名称或者PID重启服务",
    },
    stop: {
      description: "通过名称或者PID停止服务",
    },
    rm: {
      description: "通过名称或者PID停止并删除服务",
    },
    ls: {
      description: "列出通过PMB启动的服务",
    },
    daemon: {
      description: "管理守护进程",
    },
    ui: {
      description: "在浏览器中列出通过PMB启动的服务",
    },
    lang: {
      description: "切换展示语言",
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
  },
};
