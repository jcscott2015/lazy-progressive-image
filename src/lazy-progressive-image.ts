import { html, LitElement, type PropertyValues } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { customElement, property, state } from "lit/decorators.js";
import { IntersectionController } from "./IntersectionController.js";
import { styles } from "./lazy-progressive-image.styles.js";
import { noImageStyles } from "./no-image.styles.js";
import { NoImage } from "./no-image.js";

@customElement("lazy-progressive-image")
export class LazyProgressiveImage extends LitElement {
  static styles = [noImageStyles, styles];

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

    if (isExplicitlyEmpty) {
      return NoImage();
    }

    if (this._error && !this.thumbnail) {
      return NoImage();
    }

    const showThumbnail = Boolean(this.thumbnail) && !this._thumbError;
    const showFull = Boolean(this.src) && !this._error;

    return html`
      <div class="image-wrapper" part="image-wrapper">
        ${showThumbnail
          ? html`<img
              class="thumb ${this._loaded ? "loaded" : ""}"
              src=${ifDefined(this.thumbnail)}
              alt=""
              part="thumbnail"
              fetchpriority="high"
              @error=${this._handleThumbError}
            />`
          : ""}
        ${showFull
          ? html`<img
              class="full ${this._loaded ? "loaded" : ""}"
              src=${ifDefined(this.src)}
              alt=${this.alt}
              part="image"
              decoding="async"
              fetchpriority="low"
              @load=${this._handleLoad}
              @error=${this._handleError}
            />`
          : ""}
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
