import { css, html, LitElement, type PropertyValues } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { customElement, property, state } from "lit/decorators.js";
import { IntersectionController } from "./IntersectionController.js";
import { styles } from "./lazy-progressive-image.styles.js";
import { noImageStyles } from "./no-image.styles.js";
import { NoImage } from "./no-image.js";

@customElement("lazy-progressive-image")
export class LazyProgressiveImage extends LitElement {
  static styles = [
    noImageStyles,
    styles,
    css`
      :host {
        display: inline-block;
        width: 300px;
        height: 200px;
      }
      .image-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
      }
      .image-wrapper img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .thumb {
        filter: blur(8px);
        opacity: 1;
        transition: opacity 0.3s;
      }
      .full {
        opacity: 0;
        transition: opacity 0.5s;
      }
      .full.loaded {
        opacity: 1;
      }
    `,
  ];

  @property({ type: String }) src?: string;
  @property({ type: String }) thumbnail?: string;
  @property({ type: String }) alt = "";
  @property({ type: String, attribute: "root-margin" }) rootMargin = "100px";

  // Instantiate the controller. It handles all setup, breakdown, and rendering hooks.
  private _intersection = new IntersectionController(this, {
    rootMargin: this.rootMargin,
    freezeOnceVisible: true,
  });

  updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has("rootMargin")) {
      this._intersection.setOptions({ rootMargin: this.rootMargin });
    }
    if (changed.has("src")) {
      this._resetImageState();
    }
  }

  @state() private _loaded = false;
  @state() private _error = false;
  @state() private _thumbError = false;

  private _loadStartTime = 0;

  render() {
    const isVisible = this._intersection.value;

    if (!isVisible) {
      return html`<div class="placeholder">Placeholder</div>`;
    }

    const isExplicitlyEmpty =
      this.src === undefined || this.src === null || this.src.trim() === "";

    if (isExplicitlyEmpty || this._error) {
      return NoImage();
    }

    const showThumbnail = this.thumbnail && !this._thumbError && !this._loaded;

    return html`
      <div class="image-wrapper">
        ${showThumbnail
          ? html`<img
              class="thumb"
              src=${ifDefined(this.thumbnail)}
              alt=""
              @error=${this._handleThumbError}
            />`
          : ""}
        <img
          class="full ${this._loaded ? "loaded" : ""}"
          src=${ifDefined(this.src)}
          alt=${this.alt}
          decoding="async"
          @load=${this._handleLoad}
          @error=${this._handleError}
        />
      </div>
    `;
  }

  private _resetImageState() {
    this._loaded = false;
    this._error = false;
    this._thumbError = false;
    this._loadStartTime = performance.now();
  }

  private _handleLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    const loadTime = performance.now() - this._loadStartTime;

    if (typeof img.decode === "function") {
      img.decode().then(this._markLoaded).catch(this._markLoaded);
    } else {
      this._markLoaded();
    }
  }

  private _markLoaded = () => {
    this._loaded = true;
  };

  private _handleError() {
    this._error = true;
  }

  private _handleThumbError() {
    this._thumbError = true;
  }
}
