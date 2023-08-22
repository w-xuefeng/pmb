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
  console.log(list);
}

async function start(entry, name, starter, restart) {
  const list = await tell.start({ entry, name, starter, restart });
  console.log(list);
}

window.onload = async () => {
  getList();
};
