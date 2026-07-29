import type { ReactiveController, ReactiveControllerHost } from "lit";

export interface IntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export class IntersectionController implements ReactiveController {
  value = false;

  private observer?: IntersectionObserver;
  private host: Element & ReactiveControllerHost;

  constructor(
    host: Element & ReactiveControllerHost,
    private options: IntersectionOptions = {},
  ) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    if (this.options.freezeOnceVisible && this.value) return;
    this._observe();
  }

  hostDisconnected() {
    this.observer?.disconnect();
  }

  setOptions(options: IntersectionOptions) {
    const marginChanged = options.rootMargin !== this.options.rootMargin;
    this.options = { ...this.options, ...options };

    if (marginChanged && (!this.options.freezeOnceVisible || !this.value)) {
      this._observe();
    }
  }

  private _observe() {
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.value = entry.isIntersecting;
        this.host.requestUpdate();

        if (entry.isIntersecting && this.options.freezeOnceVisible) {
          this.observer?.disconnect();
        }
      },
      {
        rootMargin: this.options.rootMargin || "100px",
        threshold: this.options.threshold || 0,
      },
    );
    this.observer.observe(this.host);
  }
}
