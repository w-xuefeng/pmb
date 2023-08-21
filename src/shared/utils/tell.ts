import Talk from "./http";
import { SERVICE_PATH } from "../const/service-path";
import type { IBunProcessVO } from "./types";
import type { BunProcessStatus } from "../const";

export default class Tell {
  talk = new Talk();
  constructor(port?: number) {
    this.talk = new Talk(port);
  }
  list(filter?: {
    name?: string;
    pid?: number;
    entry?: string;
    status?: BunProcessStatus;
  }) {
    return this.talk.get<IBunProcessVO[]>(SERVICE_PATH.LIST, filter);
  }
  start(data: { name: string; entry: string; starter?: string }) {
    return this.talk.post<IBunProcessVO[]>(SERVICE_PATH.START, data);
  }
  stop(data: { name?: string; pid?: number }) {
    return this.talk.post<IBunProcessVO[]>(SERVICE_PATH.STOP, data);
  }
  rm(data: { name?: string; pid?: number }) {
    return this.talk.post<IBunProcessVO[]>(SERVICE_PATH.REMOVE, data);
  }
  ping() {
    return this.talk.ping();
  }
  updatePort(port: number) {
    this.talk.port = port;
  }
  uiPath() {
    return new URL(`${this.talk.base}:${this.talk.port}`);
  }
}