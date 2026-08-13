import { afterEach, describe, expect, test, vi } from "vitest";
import { ReactiveElement } from "lit";
import { LazyProgressiveImage } from "./lazy-progressive-image.js";
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

  test("does not render full image before intersection unless it is already cached", async () => {
    const observer = vi.fn(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
      root: null,
      rootMargin: "",
      thresholds: [],
    }));
    globalThis.IntersectionObserver =
      observer as unknown as typeof IntersectionObserver;

    const el = document.createElement(
      "lazy-progressive-image",
    ) as LazyProgressiveImage;
    el.src = "https://example.com/full.jpg";
    el.thumbnail = "https://example.com/thumb.jpg";
    el.rootMargin = "100px";
    document.body.appendChild(el);

    await Promise.resolve();

    expect(el.shadowRoot!.querySelector("img.thumb")).to.exist;
    expect(el.shadowRoot!.querySelector("img.full")).to.not.exist;

    document.body.removeChild(el);
  });

  test("renders the full image immediately, without waiting for intersection, once that source has already loaded", async () => {
    let callback: IntersectionObserverCallback | undefined;
    const observer = vi.fn((cb: IntersectionObserverCallback) => {
      callback = cb;
      return {
        observe: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(() => []),
        root: null,
        rootMargin: "",
        thresholds: [],
      };
    });
    globalThis.IntersectionObserver =
      observer as unknown as typeof IntersectionObserver;

    const src = "https://example.com/already-loaded-full.jpg";

    const first = document.createElement(
      "lazy-progressive-image",
    ) as LazyProgressiveImage;
    first.src = src;
    first.thumbnail = "https://example.com/thumb.jpg";
    document.body.appendChild(first);
    await Promise.resolve();

    // Bring the first element into view so its full image actually mounts.
    callback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    await Promise.resolve();

    const full = first.shadowRoot!.querySelector("img.full") as
      | HTMLImageElement
      | undefined;
    // Simulate the full image actually finishing a load (e.g. it was already
    // visible elsewhere on the page), which is what marks a source as loaded.
    if (full) {
      (full as unknown as { decode: () => Promise<void> }).decode = () =>
        Promise.resolve();
      full.dispatchEvent(new Event("load"));
    }
    await vi.waitUntil(() => full!.classList.contains("loaded"));
    document.body.removeChild(first);

    const second = document.createElement(
      "lazy-progressive-image",
    ) as LazyProgressiveImage;
    second.src = src;
    second.thumbnail = "https://example.com/thumb.jpg";
    document.body.appendChild(second);
    await Promise.resolve();

    // Full mounts right away (no intersection wait) because the source was
    // already loaded. The thumbnail still mounts too — it stays in the DOM
    // as a placeholder until this new <img class="full"> fires its own load
    // event, then CSS crossfades it out via `.thumb.loaded`.
    expect(second.shadowRoot!.querySelector("img.full")).to.exist;
    expect(second.shadowRoot!.querySelector("img.thumb")).to.exist;

    document.body.removeChild(second);
  });
});
