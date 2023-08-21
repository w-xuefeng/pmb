import pkg from "../../../package.json";
export interface IResponse<T> {
  success: boolean;
  message: string;
  code: number;
  data: T;
}

export default class Talk {
  port: string | number = 9501;
  base = "http://127.0.0.1";

  constructor(port: string | number = 9501, base = "http://127.0.0.1") {
    this.port = port;
    this.base = base;
  }

  async get<T>(
    path: string,
    params?: Record<string, any>,
    config?: Partial<FetchRequestInit>
  ) {
    const url = new URL(path, `${this.base}:${this.port}`);
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
        "x-version": pkg.version,
      },
    })
      .then((rs) => rs.json())
      .then((rs) => {
        return rs as IResponse<T>;
      });
  }

  async ping() {
    const url = new URL("/ping", `${this.base}:${this.port}`);
    return fetch(url, {
      method: "GET",
      headers: {
        "x-action": "ping",
        "x-version": pkg.version,
      },
    }).then((rs) => rs.text());
  }

  async post<T>(
    path: string,
    data?: Record<string, any>,
    config?: Partial<FetchRequestInit>
  ) {
    const url = new URL(path, `${this.base}:${this.port}`);
    return fetch(url, {
      ...config,
      method: "POST",
      headers: {
        "x-action": "post",
        ...config?.headers,
        "x-version": pkg.version,
      },
      body: data ? JSON.stringify(data) : void 0,
    })
      .then((rs) => rs.json())
      .then((rs) => {
        return rs as IResponse<T>;
      });
  }
}
