import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-block;
  }
  .full.loaded {
    opacity: 1;
  }

  lazy-progressive-image::part(image) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  lazy-progressive-image::part(thumbnail) {
    filter: blur(20px);
  }
`;
