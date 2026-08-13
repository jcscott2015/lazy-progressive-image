import { html, LitElement, type PropertyValues } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { customElement, property, state } from "lit/decorators.js";
import { IntersectionController } from "./intersection-controller.js";
import { styles } from "./lazy-progressive-image.styles.js";
import { noImageStyles } from "./no-image.styles.js";
import { NoImage } from "./no-image.js";
import "./loading-spinner.js";

const dispatchImageLoaded = (
  host: LazyProgressiveImage,
  src: string | undefined,
  type: "full" | "thumbnail",
) => {
  host.dispatchEvent(
    new CustomEvent("image-loaded", {
      bubbles: true,
      composed: true,
      detail: { src, type },
    }),
  );
};

@customElement("lazy-progressive-image")
export class LazyProgressiveImage extends LitElement {
  static styles = [noImageStyles, styles];

  @property({ type: String }) src?: string;
  @property({ type: String }) thumbnail?: string;
  @property({ type: String }) alt = "";
  @property({ type: String, attribute: "root-margin" }) rootMargin = "100px";

  private _intersection = new IntersectionController(this, {
    rootMargin: this.rootMargin,
    freezeOnceVisible: true,
  });

  @state() private _loaded = false;
  @state() private _error = false;
  @state() private _thumbError = false;
  @state() private _fullImageCached = false;

  private static _loadedFullImageSources = new Set<string>();

  protected willUpdate(changed: PropertyValues<this>) {
    if (changed.has("src")) {
      this._resetImageState();
      this._fullImageCached = this._isSourceLoaded(this.src);
    }
  }

  protected updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has("rootMargin")) {
      this._intersection.setOptions({ rootMargin: this.rootMargin });
    }
  }

  render() {
    if (this._isExplicitlyEmpty()) {
      return NoImage();
    }

    if (this._error && !this.thumbnail) {
      return NoImage();
    }

    const isFullInView = this._intersection.value;

    // Thumbnail stays mounted until the full image has actually loaded —
    // gating it on intersection/cache instead would unmount it the instant
    // the element comes into view, before the full image has a chance to load.
    const showThumbnail = Boolean(this.thumbnail) && !this._thumbError;
    const showFull =
      Boolean(this.src) &&
      !this._error &&
      (this._fullImageCached || isFullInView);

    return html`
      <div class="image-wrapper" part="image-wrapper">
        ${showThumbnail ? this._renderThumbnail() : ""}
        ${showFull ? this._renderFullImage() : ""}
      </div>
    `;
  }

  private _isExplicitlyEmpty() {
    return (
      this.src === undefined || this.src === null || this.src.trim() === ""
    );
  }

  private _renderThumbnail() {
    return html`<img
      class="thumb ${this._loaded ? "loaded" : ""}"
      src=${ifDefined(this.thumbnail)}
      alt=""
      part="thumbnail"
      fetchpriority="high"
      @load=${this._handleThumbnailLoad}
      @error=${this._handleThumbError}
    />`;
  }

  private _renderFullImage() {
    return html`<img
      class="full ${this._loaded ? "loaded" : ""}"
      src=${ifDefined(this.src)}
      alt=${this.alt}
      part="image"
      decoding="async"
      fetchpriority="low"
      @load=${this._handleLoad}
      @error=${this._handleError}
    />`;
  }

  private _resetImageState() {
    this._loaded = false;
    this._error = false;
    this._thumbError = false;
    this._fullImageCached = false;
  }

  private _isSourceLoaded(src?: string) {
    return !!src && LazyProgressiveImage._loadedFullImageSources.has(src);
  }

  private _handleLoad(event: Event) {
    this._decodeAndMark(event.target as HTMLImageElement, "full");
  }

  private _handleThumbnailLoad(event: Event) {
    this._decodeAndMark(event.target as HTMLImageElement, "thumbnail");
  }

  private _decodeAndMark(img: HTMLImageElement, type: "full" | "thumbnail") {
    if (typeof img.decode === "function") {
      img
        .decode()
        .then(() => this._markLoaded(type))
        .catch(() => this._markLoaded(type));
    } else {
      this._markLoaded(type);
    }
  }

  private _markLoaded(type: "full" | "thumbnail") {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (type === "full") {
          this._loaded = true;
          if (this.src) {
            LazyProgressiveImage._loadedFullImageSources.add(this.src);
            this._fullImageCached = true;
          }
        }
        dispatchImageLoaded(
          this,
          type === "full" ? this.src : this.thumbnail,
          type,
        );
      });
    });
  }

  private _handleError() {
    this._error = true;
  }

  private _handleThumbError() {
    this._thumbError = true;
  }
}
