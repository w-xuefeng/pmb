const STATUS_COLOR = {
  NOT_RUNNING: "red",
  RUNNING: "green",
  MANUAL_STOP: "gray",
};

function createTableAction(index, row) {
  const td = document.createElement("td");
  td.innerText = "action";
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
  indexTd.innerText = index;
  const keyTds = keys.map((k) => {
    const td = document.createElement("td");
    if (k === "status") {
      td.innerHTML = `<span style="color:${STATUS_COLOR[row[k]]};">
        ${row[k]}
      </span>`;
    } else {
      td.innerText = row[k];
    }
    return td;
  });
  const actionTd = createTableAction(index, row);
  tr.append(indexTd, ...keyTds, actionTd);
  return tr;
}

function appendTable(data) {
  const empty = document.querySelector(".empty-container");
  const emptyText = empty?.querySelector(".empty");
  const table = document.querySelector("table");
  if (data?.length <= 0) {
    empty.hidden = false;
    emptyText.innerText = "No process running by pmb!";
    return;
  }
  empty.hidden = true;
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
  removeTableContent();
  appendTable(data);
}

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
  async pos(path, data, config) {
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
  stop(data) {
    return this.talk.post(SERVICE_PATH.STOP, data);
  }
  rm(data) {
    return this.talk.post(SERVICE_PATH.REMOVE, data);
  }
}
const tell = new Tell();

async function getList() {
  const list = await tell.list();
  replaceTable(list.data);
}

async function start(entry, name, starter, restart) {
  const list = await tell.start({ entry, name, starter, restart });
  console.log(list);
}

window.onload = async () => {
  getList();
};
