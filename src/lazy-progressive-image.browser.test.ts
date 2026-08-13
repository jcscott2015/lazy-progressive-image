import { expect } from "@esm-bundle/chai";
import { html, render } from "lit";
import "../dist/index.js";

const delay = () => new Promise((resolve) => setTimeout(resolve, 0));
const waitUntil = async (predicate: () => boolean, timeout = 2000) => {
  const start = performance.now();

  while (true) {
    try {
      if (predicate()) return; // Success!
    } catch (e) {
      // Ignore inner errors (like reading properties of null) and retry
    }

    if (performance.now() - start > timeout) {
      throw new Error("waitUntil timeout exceeded");
    }

    await delay(); // Yields control back to browser layout engine
  }
};

describe("<lazy-progressive-image>", () => {
  let container: HTMLDivElement;
  const originalIntersectionObserver = globalThis.IntersectionObserver;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    globalThis.IntersectionObserver = class FakeIntersectionObserver {
      root = null;
      rootMargin = "0px";
      thresholds = [];

      constructor(private callback: IntersectionObserverCallback) {}

      observe(target: Element) {
        // Force an intersection event immediately upon observation
        this.callback(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalIntersectionObserver;
    container.remove();
  });

  it("renders a fallback icon when src is empty", async () => {
    render(
      html`
        <lazy-progressive-image
          src=""
          thumbnail="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          root-margin="0px"
        ></lazy-progressive-image>
      `,
      container,
    );

    const el = container.querySelector("lazy-progressive-image") as HTMLElement;
    await waitUntil(() => {
      return (
        el.shadowRoot !== null &&
        el.shadowRoot!.querySelector(".noimage-wrapper") !== null
      );
    });

    expect(el.shadowRoot!.querySelector(".noimage-wrapper")).to.exist;
    expect(el.shadowRoot!.querySelector("img")).to.not.exist;
  });

  it("renders the thumbnail and full image together so the image remains visible during slow loads", async () => {
    render(
      html`
        <lazy-progressive-image
          src="https://picsum.photos/id/10/800/600"
          thumbnail="https://picsum.photos/id/10/40/30?blur"
          root-margin="0px"
        ></lazy-progressive-image>
      `,
      container,
    );

    const el = container.querySelector("lazy-progressive-image") as HTMLElement;
    await waitUntil(() => {
      return (
        el.shadowRoot !== null &&
        el.shadowRoot.querySelector(".full") !== null &&
        el.shadowRoot.querySelector(".thumb") !== null &&
        el.shadowRoot.querySelector(".image-wrapper") !== null
      );
    });

    const full = el.shadowRoot!.querySelector(".full") as HTMLImageElement;
    const thumb = el.shadowRoot!.querySelector(".thumb") as HTMLImageElement;
    const wrapper = el.shadowRoot!.querySelector(
      ".image-wrapper",
    ) as HTMLDivElement;

    expect(full).to.exist;
    expect(thumb).to.exist;
    expect(wrapper.getAttribute("part")).to.equal("image-wrapper");
    expect(thumb.getAttribute("part")).to.equal("thumbnail");
    expect(full.getAttribute("part")).to.equal("image");
    expect(thumb.getAttribute("fetchpriority")).to.equal("high");
    expect(full.getAttribute("fetchpriority")).to.equal("low");
  });

  it("keeps the thumbnail visible instead of falling back to no-image when the full image errors", async () => {
    render(
      html`
        <lazy-progressive-image
          src="https://example.invalid/image.jpg"
          thumbnail="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          root-margin="0px"
        ></lazy-progressive-image>
      `,
      container,
    );

    const el = container.querySelector("lazy-progressive-image") as HTMLElement;

    // 1️⃣ Wait only for the initial structural elements to boot
    await waitUntil(() => {
      return (
        el.shadowRoot !== null &&
        el.shadowRoot.querySelector(".full") !== null &&
        el.shadowRoot.querySelector(".thumb") !== null
      );
    });

    const full = el.shadowRoot!.querySelector(".full") as HTMLImageElement;

    // 2️⃣ Trigger the error event on the full image element
    full.dispatchEvent(new Event("error"));

    // 3️⃣ Assert that the fallback wrapper WAS NOT added, and thumbnail stays visible
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(el.shadowRoot!.querySelector(".noimage-wrapper")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".thumb")).to.exist;
  });

  it("dispatches image-loaded with type 'full' when the full image loads", async () => {
    render(
      html`
        <lazy-progressive-image
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          root-margin="0px"
        ></lazy-progressive-image>
      `,
      container,
    );

    const el = container.querySelector("lazy-progressive-image") as HTMLElement;
    await waitUntil(() => {
      return (
        el.shadowRoot !== null && el.shadowRoot.querySelector(".full") !== null
      );
    });

    const full = el.shadowRoot!.querySelector(".full") as HTMLImageElement;
    let received: CustomEvent | undefined;

    el.addEventListener("image-loaded", (event) => {
      received = event as CustomEvent;
    });

    (full as unknown as { decode: () => Promise<void> }).decode = () =>
      Promise.resolve();
    full.dispatchEvent(new Event("load"));

    await waitUntil(() => received !== undefined);

    expect(received!.detail.type).to.equal("full");
    expect(received!.detail.src).to.equal(full.src);
    expect(received!.bubbles).to.be.true;
    expect(received!.composed).to.be.true;
  });

  it("dispatches image-loaded with type 'thumbnail' when the thumbnail loads", async () => {
    render(
      html`
        <lazy-progressive-image
          src="https://example.invalid/full.jpg"
          thumbnail="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          root-margin="0px"
        ></lazy-progressive-image>
      `,
      container,
    );

    const el = container.querySelector("lazy-progressive-image") as HTMLElement;
    await waitUntil(() => {
      return (
        el.shadowRoot !== null && el.shadowRoot.querySelector(".thumb") !== null
      );
    });

    const thumb = el.shadowRoot!.querySelector(".thumb") as HTMLImageElement;
    let received: CustomEvent | undefined;

    el.addEventListener("image-loaded", (event) => {
      received = event as CustomEvent;
    });

    (thumb as unknown as { decode: () => Promise<void> }).decode = () =>
      Promise.resolve();
    thumb.dispatchEvent(new Event("load"));

    await waitUntil(() => received !== undefined);

    expect(received!.detail.type).to.equal("thumbnail");
    expect(received!.detail.src).to.equal(thumb.src);
  });
});
