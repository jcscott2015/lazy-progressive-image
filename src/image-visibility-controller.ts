import type { ReactiveController, ReactiveControllerHost } from "lit";
import {
  IntersectionController,
  type IntersectionOptions,
} from "./intersection-controller.js";

export class ImageVisibilityController implements ReactiveController {
  public value = false;

  private intersectionController: IntersectionController;
  private targetImage: HTMLImageElement | null = null;
  private host: ReactiveControllerHost;
  private options: IntersectionOptions;

  constructor(
    host: Element & ReactiveControllerHost,
    options: IntersectionOptions = {},
  ) {
    this.host = host;
    this.options = options;
    this.intersectionController = new IntersectionController(host, options);

    // Register this wrapper controller to Lit's lifecycle management
    host.addController(this);
  }

  /**
   * Sets new intersection observer options on the internal controller
   * @param options The intersection observer options to set on the internal controller
   */
  public setOptions(options: IntersectionOptions) {
    this.options = { ...this.options, ...options };
    this.intersectionController.setOptions(this.options);
  }

  /**
   * Binds the internal image target reference
   * @param img The image element to observe for visibility
   */
  public attach(img: HTMLImageElement | null | undefined) {
    // If undefined, convert it to null or return early
    if (!img) {
      this.targetImage = null;
      return;
    }
    if (this.targetImage === img) return;

    this.targetImage = img;
    this.evaluateVisibility();
  }

  /**
   * Evaluates the image's layout and decode state on host updates
   */
  async hostUpdate() {
    await this.evaluateVisibility();
  }

  private async evaluateVisibility() {
    let isVisible = this.intersectionController.value;

    if (isVisible && this.targetImage) {
      const rect = this.targetImage.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(this.targetImage);

      if (
        rect.width === 0 ||
        rect.height === 0 ||
        computedStyle.visibility === "hidden" ||
        computedStyle.opacity === "0"
      ) {
        isVisible = false;
      }

      if (isVisible) {
        if (typeof this.targetImage.decode === "function") {
          try {
            await this.targetImage.decode();
          } catch {
            isVisible = false; // Handles broken image sources safely
          }
        } else {
          const isLoaded =
            this.targetImage.complete && this.targetImage.naturalWidth > 0;
          if (!isLoaded) isVisible = false;
        }
      }
    }

    // 6. Update the wrapped value state if it changed
    if (this.value !== isVisible) {
      this.value = isVisible;
      this.host.requestUpdate();
    }
  }
}
