import setPromiseInterval, {
  clearPromiseInterval,
} from "./set-promise-interval";

export class KeepProcessAlive {
  intervalId?: number;
  interval = 0;
  handler: (...args: any[]) => Promise<any>;
  onError?: (error?: unknown) => void;

  constructor(
    handler: (...args: any[]) => Promise<any>,
    interval?: number,
    onError?: (error?: unknown) => void
  ) {
    this.handler = handler;
    this.onError = onError;
    if (interval) {
      this.interval = interval;
    }
  }

  static create(
    handler: (...args: any[]) => Promise<any>,
    interval?: number,
    onError?: (error?: unknown) => void
  ) {
    return new KeepProcessAlive(handler, interval, onError);
  }

  start() {
    this.intervalId = setPromiseInterval(
      this.handler,
      this.interval,
      this.onError
    );
    return this.intervalId;
  }

  stop() {
    clearPromiseInterval(this.intervalId);
  }

  free() {
    this.stop();
    this.start = () => -1;
  }
}
