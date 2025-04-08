/**
 * config
 */
function getConfig(key = "") {
  return key
    ? key in window.__$GLOBAL_UI_CONFIG
      ? window.__$GLOBAL_UI_CONFIG[key]
      : void 0
    : window.__$GLOBAL_UI_CONFIG;
}

function getLang(key = "", defaultValue = "") {
  const langConf = getConfig("lang");
  return key
    ? key in langConf
      ? langConf[key] ?? defaultValue
      : defaultValue
    : langConf;
}

/**
 * dom
 */
const STATUS_COLOR = {
  NOT_RUNNING: "red",
  RUNNING: "green",
  MANUAL_STOP: "gray",
};

const restartAction = {
  text: getLang("actionRestart", "restart"),
  handler: restart,
  classNames: "restart-btn btn action",
};

const stopAction = {
  text: getLang("actionStop", "stop"),
  handler: stop,
  classNames: "stop-btn btn action",
};

const removeAction = {
  text: getLang("actionRemove", "remove"),
  handler: remove,
  classNames: "remove-btn btn action",
};

const ACTION_MAP = {
  NOT_RUNNING: [restartAction, stopAction, removeAction],
  RUNNING: [restartAction, stopAction, removeAction],
  MANUAL_STOP: [restartAction, removeAction],
};

function createLoading() {
  const div = document.createElement("div");
  div.className = "loading";
  div.innerText = getLang("processing", "processing...");
  return div;
}

function addEvent(dom, eventName, handler, options) {
  (typeof dom === "string"
    ? document.querySelector(dom)
    : dom
  )?.addEventListener(eventName, handler, options);
}

function createTableAction(row, index) {
  const td = document.createElement("td");
  td.className = "actions";
  const div = document.createElement("div");
  div.className = `action-container action-container-${index}`;
  const actions = ACTION_MAP[row.status].map((act) => {
    const span = document.createElement("span");
    span.className = act.classNames;
    span.innerText = act.text;
    addEvent(span, "click", async () => {
      const container = document.querySelector(`.action-container-${index}`);
      container.style.display = "none";
      const lodaing = createLoading();
      container.parentElement.append(lodaing);
      await act.handler(row.name);
    });
    return span;
  });
  div.append(...actions);
  td.append(div);
  return td;
}

function createTableRow(index, row) {
  const tr = document.createElement("tr");
  const keys = [
    "name",
    "pid",
    "starter",
    "entry",
    "status",
    "startTime",
    "restRestartCount",
    "args",
  ];
  const indexTd = document.createElement("td");
  indexTd.className = "index";
  indexTd.innerText = index;
  const keyTds = keys.map((k) => {
    const td = document.createElement("td");
    td.className = k;
    if (k === "status") {
      td.innerHTML = `<span style="color:${STATUS_COLOR[row[k]]};">
        ${row[k]}
      </span>`;
    } else {
      td.innerText = row[k];
    }
    td.title = row[k];
    return td;
  });
  const actionTd = createTableAction(row, index);
  tr.append(indexTd, ...keyTds, actionTd);
  return tr;
}

function appendTable(data) {
  const table = document.querySelector("table");
  const rows = data.map((row, index) => createTableRow(index + 1, row));
  table.append(...rows);
}

function removeTableContent() {
  const table = document.querySelector("table");
  const trs = Array.from(table?.querySelectorAll("tr"));
  const keepClassName = ["thead", "empty-container"];
  trs.forEach((e) => {
    if (!keepClassName.some((cls) => e.classList?.contains?.(cls))) {
      e?.remove?.();
    }
  });
}

function replaceTable(data) {
  removeTableContent();
  const empty = document.querySelector(".empty-container");
  if (data?.length <= 0) {
    const emptyText = empty?.querySelector(".empty");
    empty.hidden = false;
    emptyText.innerText = getLang("empty", "No process running by pmb!");
    return;
  }
  empty.hidden = true;
  appendTable(data);
}

/**
 * ajax
 */

class Talk {
  async get(path, params, config) {
    const url = path;
    let search = "";
    if (params) {
      const searchParams = new URLSearchParams();
      const keys = Object.getOwnPropertyNames(params).forEach((k) => {
        searchParams.append(k, params[k]);
      });
      search = searchParams.toString();
    }
    return fetch(`${url}${search ? "?" : ""}${search}`, {
      ...config,
      method: "GET",
      headers: {
        "x-action": "get",
        ...config?.headers,
        "x-from": "ui-web",
      },
    }).then((rs) => rs.json());
  }
  async post(path, data, config) {
    const url = path;
    return fetch(url, {
      ...config,
      method: "POST",
      headers: {
        "x-action": "post",
        ...config?.headers,
        "x-from": "ui-web",
      },
      body: data ? JSON.stringify(data) : void 0,
    }).then((rs) => rs.json());
  }
}

const SERVICE_PATH = {
  LIST: "/process/list",
  START: "/process/start",
  RESTART: "/process/restart",
  STOP: "/process/stop",
  REMOVE: "/process/remove",
};

class Tell {
  talk = new Talk();
  constructor() {
    this.talk = new Talk();
  }
  list(filter) {
    return this.talk.get(SERVICE_PATH.LIST, filter);
  }
  start(data) {
    return this.talk.post(SERVICE_PATH.START, data);
  }
  restart(data) {
    return this.talk.post(SERVICE_PATH.RESTART, data);
  }
  stop(data) {
    return this.talk.post(SERVICE_PATH.STOP, data);
  }
  rm(data) {
    return this.talk.post(SERVICE_PATH.REMOVE, data);
  }
}

const tell = new Tell();

/**
 * action
 */

async function list() {
  const list = await tell.list();
  replaceTable(list.data);
}

async function start(entry, name, starter, restart, cwd, args) {
  await tell.start({ entry, name, starter, restart, cwd, args });
  await list();
}

async function stop(name) {
  const list = await tell.stop({ name });
  replaceTable(list.data);
}

async function remove(name) {
  const list = await tell.rm({ name });
  replaceTable(list.data);
}

async function restart(name) {
  const list = await tell.restart({ name });
  replaceTable(list.data);
}

function createName(entry) {
  return `${Date.now()}-${entry.split("/").at(-1)}`;
}

async function startProcess(value) {
  const {
    cwd,
    entry,
    name = createName(entry),
    starter = "bun",
    restart = 10,
    args = "",
  } = value;
  await start(entry, name, starter, restart, cwd, args);
}

function initDialogValue() {
  return {
    entry: "",
    cwd: getConfig("cwd"),
    name: "",
    starter: "bun",
    restart: 10,
    args: "",
  };
}

let dialogValue = initDialogValue();

function initStartDialog() {
  const startDialog = document.querySelector(".start-dialog");
  const entryInput = document.querySelector("#entry");
  const cwdInput = document.querySelector("#cwd");
  const nameInput = document.querySelector("#name");
  const starterInput = document.querySelector("#starter");
  const restartInput = document.querySelector("#restart");
  const argsInput = document.querySelector("#args");
  const closeBtn = document.querySelector(".close-btn");

  entryInput.value = dialogValue.entry;
  cwdInput.value = dialogValue.cwd;
  nameInput.value = dialogValue.name;
  starterInput.value = dialogValue.starter;
  restartInput.value = dialogValue.restart;
  argsInput.value = dialogValue.args;

  addEvent(entryInput, "input", async (e) => {
    dialogValue.entry = e?.target?.value;
  });
  addEvent(cwdInput, "input", (e) => {
    dialogValue.cwd = e?.target?.value;
  });
  addEvent(nameInput, "input", (e) => {
    dialogValue.name = e?.target?.value;
  });
  addEvent(starterInput, "input", (e) => {
    dialogValue.starter = e?.target?.value;
  });
  addEvent(restartInput, "input", (e) => {
    dialogValue.restart = e?.target?.value;
  });
  addEvent(argsInput, "input", (e) => {
    dialogValue.args = e?.target?.value;
  });
  addEvent(closeBtn, "click", () => {
    startDialog?.close?.();
  });
  startDialog?.addEventListener("close", () => {
    if (startDialog.returnValue !== "confirm") {
      return;
    }
    if (dialogValue.entry && dialogValue.cwd) {
      startProcess(dialogValue);
      entryInput.value = "";
      cwdInput.value = getConfig("cwd");
      nameInput.value = "";
      starterInput.value = "bun";
      restartInput.value = 10;
      argsInput.value = "";
    } else {
      console.log("missing param");
    }
  });
}

function showStartDialog() {
  const startDialog = document.querySelector(".start-dialog");
  startDialog?.showModal?.();
  dialogValue = initDialogValue();
}

let loopTimer = void 0;
function startLoop(gapTime) {
  clearInterval(loopTimer);
  loopTimer = setInterval(() => {
    list();
  }, gapTime);
}

async function displayLang() {
  const lang = getLang();
  Object.keys(lang).forEach((k) => {
    const dom = document.querySelector(`[data-lang-key=${k}]`);
    if (dom) {
      dom.innerText = lang[k];
    }
  });
}

window.onload = async () => {
  displayLang();
  initStartDialog();
  addEvent(".start-btn", "click", showStartDialog);
  list();
  startLoop(1000 * 10);
};
