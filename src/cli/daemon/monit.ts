import blessed from "blessed";
import colors from "colors";
import greetDaemon, { checkDaemon } from "./run";
import { useI18n } from "../../i18n";
import { intlTimeFormat } from "../../shared/utils";
import { Setting } from "../../shared/utils/setting";
import {
  BunProcessStatusColor,
  PROCESS_MAX_RESTART_COUNT,
  readConf,
} from "../../shared/const";
import { getCommand } from "../../shared/const/commands";
import type { IBunProcessVO } from "../../shared/utils/types";

/**
 * config options
 */
const commonBoxOption: Partial<blessed.Widgets.BoxOptions> = {
  tags: true,
  mouse: true,
  keyable: true,
  scrollable: true,
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "black",
    border: {
      fg: "#3b70c2",
    },
  },
};

const globalRef = {
  processList: [] as IBunProcessVO[],
  currentProcess: null as IBunProcessVO | null,
  config: "\n",
  timer: void 0 as Timer | undefined,
};

/**
 * utils
 */
const createBox = (
  screen: blessed.Widgets.Screen,
  label: string,
  options: Partial<blessed.Widgets.BoxOptions>
) => {
  const box = blessed.box({
    ...commonBoxOption,
    label,
    ...options,
  });
  screen.append(box);
  return box;
};

const getMemeryOrCPUByPID = (pid: string, type: "mem" | "cpu") => {
  const { command, parseOutput } = getCommand('taskMemCPUInfo', `${pid}`, type);
  const rs = Bun.spawnSync(command);
  const out = rs.stdout.toString();
  return parseOutput(out);
};

const mapProcessItem = (e: IBunProcessVO, i: number) => {
  const name = e.name.slice(-14).padEnd(14);
  const pid = String(e.pid).padEnd(8);
  const status = colors[BunProcessStatusColor[e.status]](e.status).padEnd(11);
  const mem = `MEM:${getMemeryOrCPUByPID(e.pid, "mem")}`.padEnd(8);
  const cpu = `CPU:${getMemeryOrCPUByPID(e.pid, "cpu")}`.padEnd(8);
  return `${i + 1}.${name} ${pid}  ${status}  ${mem}  ${cpu}`;
};

const mapRow = (obj: Record<string, any>) =>
  Object.keys(obj).map((k) => `${k}: ${obj[k] || '-'}`);

const setMetadata = (metaBox: blessed.Widgets.BoxElement) => {
  if (!globalRef.currentProcess) return;
  metaBox.setContent(mapRow(globalRef.currentProcess).join("\n"));
};

const setLog = async (logBox: blessed.Widgets.BoxElement, loading = false) => {
  if (!globalRef.currentProcess) {
    logBox.setContent("");
    return;
  }
  if (loading) {
    logBox.setContent("loading...");
  }
  const tell = await greetDaemon();
  const res = await tell.log({ name: globalRef.currentProcess.name });
  logBox.setContent(res.data);
};

const getGlobalConfig = async () => {
  const { lang } = await useI18n();
  const interval = await Setting.getSetting("polling.interval", 10 * 1000);
  const UIEnable = await Setting.getSetting("ui.enable");
  const daemon = await checkDaemon();
  const customConfig = {
    lang,
    daemonStatus: daemon
      ? colors[BunProcessStatusColor["RUNNING"]]("RUNNING")
      : colors[BunProcessStatusColor["NOT_RUNNING"]]("NOT_RUNNING"),
    daemonPID: daemon ? daemon.at(0) : null,
    daemonPort: daemon ? daemon.at(1) : null,
    daemonStartTime:
      daemon && daemon.at(2) ? intlTimeFormat(daemon.at(2)) : null,
    roundRobinInterval: `${interval}ms`,
    UIEnable,
  };
  globalRef.config = mapRow(customConfig).join("\n");
};

const getCustomConfig = async (metricsBox: blessed.Widgets.BoxElement) => {
  if (!globalRef.currentProcess) return;
  const itemConfig = await readConf<["restart"]>(
    ["restart"],
    {
      restart: PROCESS_MAX_RESTART_COUNT,
    },
    globalRef.currentProcess.cwd
  );
  metricsBox.setContent([...mapRow(itemConfig), globalRef.config].join("\n"));
};

const getList = async (
  list: blessed.Widgets.ListElement,
  listBox: blessed.Widgets.BoxElement,
  logBox: blessed.Widgets.BoxElement,
  metaBox: blessed.Widgets.BoxElement,
  metricsBox: blessed.Widgets.BoxElement
) => {
  const { t } = await useI18n();
  const tell = await greetDaemon();
  const rs = await tell.list();

  if (!rs?.success) {
    listBox.setContent(t("process.listError"));
    return;
  }

  if (!rs.data?.length) {
    listBox.setContent(t("process.listEmpty"));
    return;
  }
  globalRef.processList = rs.data;
  globalRef.currentProcess =
    globalRef.currentProcess || globalRef.processList[0];

  list.setItems(globalRef.processList.map(mapProcessItem));

  setMetadata(metaBox);
  await setLog(logBox);
  await getCustomConfig(metricsBox);
};

/**
 * monit
 */
export default async function monit() {
  const { t } = await useI18n();
  /**
   * screen
   */
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
  });
  screen.title = "PMB Monit";

  /**
   * list box
   */
  const listBox = createBox(screen, t("cli.monit.processList"), {
    top: "0%",
    left: "0%",
    width: "40%",
    height: "60%",
  });

  /**
   * log box
   */
  const logBox = createBox(screen, t("cli.monit.processLog"), {
    top: "0%",
    left: "40%",
    width: "60%",
    height: "60%",
  });

  /**
   * custome metrics
   */
  const metricsBox = createBox(screen, t("cli.monit.customMetrics"), {
    top: "60%",
    left: "0%",
    width: "40%",
    height: "40%",
  });

  /**
   * metadata box
   */
  const metadataBox = createBox(screen, t("cli.monit.processMetadata"), {
    top: "60%",
    left: "40%",
    width: "60%",
    height: "40%",
  });

  screen.key(["escape", "q", "C-c"], function (ch, key) {
    return process.exit(0);
  });

  const list = blessed.list({
    parent: listBox,
    top: 0,
    left: 0,
    keys: true,
    vi: true,
    mouse: true,
    style: {
      fg: "white",
      selected: {
        bg: "blue",
      },
    },
  });

  const onSelect = async (_: blessed.Widgets.BlessedElement, i: number) => {
    globalRef.currentProcess = globalRef.processList?.[i];
    setMetadata(metadataBox);
    await setLog(logBox, true);
    await getCustomConfig(metricsBox);
  };

  list.on("select item", onSelect);

  await getGlobalConfig();
  await getList(list, listBox, logBox, metadataBox, metricsBox);

  listBox.focus();
  screen.render();

  /**
   * keep alive
   */
  const alive = () => {
    getList(list, listBox, logBox, metadataBox, metricsBox).finally(() => {
      screen.render();
      clearTimeout(globalRef.timer);
      globalRef.timer = setTimeout(() => {
        alive();
      }, 2000);
    });
  };

  alive();
}
