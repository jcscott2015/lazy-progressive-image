import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";

export class LoadingSpinner extends LitElement {
  // Add 'accessor' to prevent initialization from wiping out Lit's reactivity
  @property({ type: String }) accessor size = "40px";
  @property({ type: String }) accessor color = "#007bef";
  @property({ type: String }) accessor speed = "1s";

  static styles = css`
    :host {
      display: inline-block;
    }
    .spinner {
      width: var(--spinner-size, 40px);
      height: var(--spinner-size, 40px);
      border: calc(var(--spinner-size, 40px) / 8) solid #f3f3f3;
      border-top: calc(var(--spinner-size, 40px) / 8) solid
        var(--spinner-color, #007bef);
      border-radius: 50%;
      animation: spin var(--spinner-speed, 1s) linear infinite;
      box-sizing: border-box;
    }
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;

  render() {
    return html`
      <div
        class="spinner"
        style=" 
        --spinner-size: ${this.size}; 
        --spinner-color: ${this.color}; 
        --spinner-speed: ${this.speed}; 
      "
        role="progressbar"
        aria-label="Loading"
      ></div>
    `;
  }
}

customElements.define("loading-spinner", LoadingSpinner);
