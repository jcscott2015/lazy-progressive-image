import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-block;
    width: 300px;
    height: 200px;
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    /* Explicit height (not auto) — .thumb is absolutely positioned/out of
       flow, so when .full isn't mounted yet this wrapper would otherwise
       collapse to 0 height and hide the thumbnail entirely. */
    height: 100%;
    display: block;
  }

  .image-wrapper img {
    position: static;
    inset: 0;
    display: block;
    width: 100%;
    height: auto;
    object-fit: var(--lpi-image-object-fit, contain);
    filter: var(--lpi-image-filter, none);
  }

  .image-wrapper img.thumb {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: var(--lpi-thumbnail-opacity, 1);
    filter: var(--lpi-image-filter, blur(0px))
      var(--lpi-thumbnail-filter, blur(var(--lpi-thumbnail-blur, 8px)));
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
