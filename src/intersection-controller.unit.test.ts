import { afterEach, describe, expect, test, vi } from "vitest";
import { ReactiveElement } from "lit";
import { IntersectionController } from "./intersection-controller.js";

class FakeHost extends ReactiveElement {
  requestUpdateCalled = 0;

  override requestUpdate() {
    this.requestUpdateCalled++;
  }
}

customElements.define("fake-host", FakeHost);

describe("IntersectionController", () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver;

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.IntersectionObserver = originalIntersectionObserver;
  });

  test("starts with value false", () => {
    const host = new FakeHost();
    const controller = new IntersectionController(host);

    expect(controller.value).toBe(false);
  });

  test("uses provided rootMargin and observes the host", () => {
    const host = document.createElement("fake-host") as FakeHost;
    const observe = vi.fn();
    let constructorOptions: IntersectionObserverInit | undefined;

    globalThis.IntersectionObserver = vi.fn(
      (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) => {
        constructorOptions = options;
        return {
          observe,
          disconnect: vi.fn(),
          takeRecords: vi.fn(() => []),
          root: null,
          rootMargin: "",
          thresholds: [],
        } as unknown as IntersectionObserver;
      },
    ) as unknown as typeof IntersectionObserver;

    new IntersectionController(host, { rootMargin: "50px" });
    host.connectedCallback();

    expect(constructorOptions).toEqual(
      expect.objectContaining({ rootMargin: "50px" }),
    );
    expect(observe).toHaveBeenCalledWith(host);
  });

  test("updates value and requests update on intersection", () => {
    const host = document.createElement("fake-host") as FakeHost;
    let callback: IntersectionObserverCallback | undefined;

    globalThis.IntersectionObserver = vi.fn(
      (cb: IntersectionObserverCallback) => {
        callback = cb;
        return {
          observe: vi.fn(),
          disconnect: vi.fn(),
          takeRecords: vi.fn(() => []),
          root: null,
          rootMargin: "",
          thresholds: [],
        } as unknown as IntersectionObserver;
      },
    ) as unknown as typeof IntersectionObserver;

    const controller = new IntersectionController(host);
    host.connectedCallback();

    callback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(controller.value).toBe(true);
    expect(host.requestUpdateCalled).toBe(1);
  });
});
