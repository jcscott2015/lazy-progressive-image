import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-block;
    width: var(--lpi-width, 300px);
    height: var(--lpi-height, 200px);
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: block;
  }

  .image-wrapper img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: var(--lpi-image-object-fit, contain);
    box-shadow: var(--lpi-image-shadow, none);
    border-radius: var(--lpi-image-border-radius, 0);
    filter: var(--lpi-image-filter, none);
  }

  .image-wrapper img.thumb {
    opacity: var(--lpi-thumbnail-opacity, 1);
    filter: var(--lpi-thumbnail-filter, blur(var(--lpi-thumbnail-blur, 8px)));
    transition: var(--lpi-thumbnail-transition, opacity 0.3s ease);
    clip-path: inset(0);
  }

  .image-wrapper img.thumb.loaded {
    opacity: 0;
  }

  .image-wrapper img.full {
    opacity: var(--lpi-image-opacity, 0);
    transition: var(--lpi-image-transition, opacity 0.5s ease);
  }

  .image-wrapper img.full.loaded {
    opacity: 1;
  }
`;
