/**
 * dom
 */

const STATUS_COLOR = {
  NOT_RUNNING: "red",
  RUNNING: "green",
  MANUAL_STOP: "gray",
};

const restartAction = {
  text: "restart",
  handler: restart,
  classNames: "restart-btn btn action",
};

const stopAction = {
  text: "stop",
  handler: stop,
  classNames: "stop-btn btn action",
};

const removeAction = {
  text: "remove",
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
  div.innerText = "processing...";
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
  trs.forEach((e, i) => {
    if (i > 1) {
      e?.remove();
    }
  });
}

function replaceTable(data) {
  const empty = document.querySelector(".empty-container");
  if (data?.length <= 0) {
    const emptyText = empty?.querySelector(".empty");
    empty.hidden = false;
    emptyText.innerText = "No process running by pmb!";
    return;
  }
  empty.hidden = true;
  removeTableContent();
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

async function start(entry, name, starter, restart, cwd) {
  await tell.start({ entry, name, starter, restart, cwd });
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

let loopTimer = void 0;
function startLoop(gapTime) {
  clearInterval(loopTimer);
  loopTimer = setInterval(() => {
    list();
  }, gapTime);
}

window.onload = async () => {
  list();
  startLoop(1000 * 10);
};
