import { expect } from "@esm-bundle/chai";
import { html, render } from "lit";
import "../dist/index.js";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitFor = async (predicate: () => boolean, timeout = 2000) => {
  const start = performance.now();
  while (!predicate()) {
    if (performance.now() - start > timeout) {
      throw new Error("waitFor timeout");
    }
    await delay(10);
  }
};

describe("<lazy-progressive-image>", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.style.height = "100vh";
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("renders a placeholder before the element is visible", async () => {
    render(
      html`
        <div style="height: 120vh;"></div>
        <lazy-progressive-image
          src="https://picsum.photos/id/10/800/600"
          thumbnail="https://picsum.photos/id/10/40/30?blur"
          root-margin="0px"
        ></lazy-progressive-image>
      `,
      container,
    );

    const el = container.querySelector("lazy-progressive-image") as HTMLElement;
    await waitFor(() => el.shadowRoot !== null);

    const placeholder = el.shadowRoot!.querySelector(".placeholder");
    expect(placeholder).to.exist;
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
    await waitFor(() => el.shadowRoot !== null);
    await waitFor(() => el.shadowRoot!.querySelector(".thumb") !== null);

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
  });
});
