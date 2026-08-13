# lazy-progressive-image

[![npm](https://img.shields.io/npm/v/lazy-progressive-image.svg)](https://www.npmjs.com/package/lazy-progressive-image)

A universal progressive image component for Web Components, React, Vue, and Svelte.

It renders a blurred thumbnail first, lazy-loads the full image when visible, and swaps to a fallback icon when the full image is missing or errors.

## Features

- Progressive loading with blur thumb -> full image transition
- `IntersectionObserver` visibility trigger with preload margin
- Fallback rendering for empty or broken full-size images
- Thumb failure isolation (thumb can fail without hiding full image)
- Universal: vanilla HTML/JS web component + React wrapper
- TypeScript types included

## How Lazy Loading Works

1. The component mounts a wrapper element and watches it with `IntersectionObserver`.
2. The thumbnail (if provided) renders immediately as a placeholder, independent of visibility — it stays mounted until the full image has actually loaded.
3. The full image is not rendered (and not fetched) until the wrapper is near/in view (`rootMargin: 100px`) — **unless** that exact `src` has already finished loading elsewhere on the page during this session, in which case it renders right away without waiting for intersection.
4. On full image `load`, the component calls `HTMLImageElement.decode()` when available.
5. Once decode completes (or immediately after `load` on browsers without `decode`), the full image fades in and the thumbnail fades out via CSS transition.

This means visibility (or a known-loaded cache hit) controls network/render timing, and `decode()` helps avoid showing a partially decoded full image.

## Install

```bash
pnpm add lazy-progressive-image
```

or

```bash
npm i lazy-progressive-image
```

## Usage

### Vanilla HTML/JS

Import the web component and use it directly in HTML:

```html
<!doctype html>
<html lang="en">
  <head>
    <script type="importmap">
      {
        "imports": {
          "lit": "https://esm.sh/lit@3.2.0",
          "lit/": "https://esm.sh/lit@3.2.0/"
        }
      }
    </script>
    <script type="module">
      import "lazy-progressive-image";
    </script>
  </head>
  <body>
    <lazy-progressive-image
      src="https://example.com/full.jpg"
      thumbnail="https://example.com/thumb.jpg"
      alt="Example image"
      root-margin="100px"
    ></lazy-progressive-image>
  </body>
</html>
```

### React

The `/react` export wraps the web component with typed props and React-style event handlers.

```tsx
import { LazyProgressiveImage } from "lazy-progressive-image/react";

export function Example() {
  return (
    <LazyProgressiveImage
      src="https://example.com/full.jpg"
      thumbnail="https://example.com/thumb.jpg"
      alt="Example image"
    />
  );
}
```

In **React 19 and later**, you can also use the custom element directly without the wrapper:

```tsx
import "lazy-progressive-image";

export function Example() {
  return (
    <lazy-progressive-image
      src="https://example.com/full.jpg"
      thumbnail="https://example.com/thumb.jpg"
      alt="Example image"
      root-margin="100px"
    ></lazy-progressive-image>
  );
}
```

Use the wrapper when you want TypeScript JSX types and `onLoad`/`onError` props. Use the direct element when you prefer zero abstraction and only need standard attributes.

If you want to reference the React props type explicitly, import it from the React entrypoint:

```tsx
import {
  LazyProgressiveImage,
  type LazyProgressiveImageProps,
} from "lazy-progressive-image/react";

const props: LazyProgressiveImageProps = {
  src: "https://example.com/full.jpg",
  thumbnail: "https://example.com/thumb.jpg",
  alt: "Example image",
};
```

### Vue

```vue
<script setup>
import { LazyProgressiveImage } from "lazy-progressive-image";
</script>

<template>
  <lazy-progressive-image
    src="https://example.com/full.jpg"
    thumbnail="https://example.com/thumb.jpg"
    alt="Example image"
    root-margin="100px"
  ></lazy-progressive-image>
</template>
```

### Svelte

```svelte
<script>
  import "lazy-progressive-image";
</script>

<lazy-progressive-image
  src="https://example.com/full.jpg"
  thumbnail="https://example.com/thumb.jpg"
  alt="Example image"
  root-margin="100px"
></lazy-progressive-image>
```

## Listening for image load events

The component dispatches a bubbling, composed `image-loaded` custom event whenever an image finishes loading. The event `detail` tells you which image variant loaded and its URL:

| Field         | Type                    | Description                                              |
| ------------- | ----------------------- | -------------------------------------------------------- |
| `detail.src`  | `string \| undefined`   | The URL of the image that loaded (`src` or `thumbnail`). |
| `detail.type` | `"full" \| "thumbnail"` | Which variant loaded.                                    |

### Vanilla HTML/JS

```js
const image = document.querySelector("lazy-progressive-image");

image.addEventListener("image-loaded", (event) => {
  const { src, type } = event.detail;
  console.log(`${type} image loaded:`, src);
});
```

### React

With the React wrapper, use the `onLoad` prop:

```tsx
import { LazyProgressiveImage } from "lazy-progressive-image/react";

<LazyProgressiveImage
  src="https://example.com/full.jpg"
  thumbnail="https://example.com/thumb.jpg"
  alt="Example image"
  onLoad={(event) => {
    const { src, type } = (event as CustomEvent).detail;
    console.log(`${type} image loaded:`, src);
  }}
/>;
```

When using the custom element directly in React 19, attach the listener via `ref`:

```tsx
import "lazy-progressive-image";

<lazy-progressive-image
  ref={(el) => {
    el?.addEventListener("image-loaded", (e) => {
      const { src, type } = (e as CustomEvent).detail;
      console.log(`${type} image loaded:`, src);
    });
  }}
  src="https://example.com/full.jpg"
  thumbnail="https://example.com/thumb.jpg"
  alt="Example image"
></lazy-progressive-image>;
```

### Vue

```vue
<template>
  <lazy-progressive-image
    src="https://example.com/full.jpg"
    thumbnail="https://example.com/thumb.jpg"
    alt="Example image"
    @image-loaded="onImageLoaded"
  />
</template>

<script setup>
function onImageLoaded(event) {
  const { src, type } = event.detail;
  console.log(`${type} image loaded:`, src);
}
</script>
```

### Svelte

```svelte
<lazy-progressive-image
  src="https://example.com/full.jpg"
  thumbnail="https://example.com/thumb.jpg"
  alt="Example image"
  on:image-loaded={(event) => {
    const { src, type } = event.detail;
    console.log(`${type} image loaded:`, src);
  }}
/>
```

## Styling with CSS custom properties

The component exposes a small set of CSS custom properties so you can override its appearance from a parent page without reaching into its internal shadow DOM.

```html
<style>
  lazy-progressive-image {
    --lpi-image-object-fit: cover;
    --lpi-image-filter: grayscale(1);
    --lpi-thumbnail-filter: contrast(1.2) brightness(1.2);
    --lpi-thumbnail-blur: 20px;
  }
</style>
```

Useful properties include:

- `--lpi-image-object-fit`, and `--lpi-image-filter` for the full image
- `--lpi-thumbnail-opacity`, `--lpi-thumbnail-filter`, and `--lpi-thumbnail-blur` for the thumbnail
- `--lpi-image-opacity`, `--lpi-image-transition`, and `--lpi-thumbnail-transition` for transition behavior

The styles for the `lazy-progressive-image` element itself can be overridden with normal CSS properties:

```css
lazy-progressive-image {
  display: block;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
```

> **Note:** the component needs a definite height to have somewhere to render the thumbnail placeholder before any image has loaded (the default `:host` sizing is a fixed `300px` × `200px`). When overriding size from the consumer, set an explicit `height` or an `aspect-ratio` as shown above — `height: auto` alone will collapse to 0px until the full image loads, since the placeholder is positioned absolutely and can't establish its own height.

## Examples

Example projects for each framework live under `examples/`:

```
examples/
├── vanilla/
│   └── index.html
├── react/
│   ├── App.tsx
│   └── package.json
├── vue/
│   └── App.vue
└── svelte/
    └── App.svelte
```

To run the vanilla example:

```bash
cd examples/vanilla
npx serve .
```

To run a framework example, follow the `package.json` scripts inside each directory.

## API

### Web component attributes

- `src?: string` — full-size image URL
- `thumbnail?: string` — blurred thumbnail URL
- `alt?: string` — image alt text
- `root-margin?: string` — `IntersectionObserver` root margin (default: `"100px"`)

### React props

- `src?: string`
- `thumbnail?: string`
- `alt?: string`
- `rootMargin?: string` — `IntersectionObserver` root margin (default: `"100px"`)
- `className?: string`
- `style?: React.CSSProperties`
- `onLoad?: (event: Event) => void`
- `onError?: (event: Event) => void`

## Local Development

```bash
pnpm install
pnpm test
pnpm build
```

### Tests

This project uses two test runners:

- **Unit tests** — Vitest with happy-dom for fast logic tests.
- **Browser tests** — `@web/test-runner` with Playwright for real browser behavior.

```bash
pnpm run test:unit     # Vitest
pnpm run test:browser  # Playwright/Chromium
pnpm test              # both
```

## Publish in a New Repo

1. Copy the repository contents into a new git repository root.
2. Optionally rename the package in `package.json` (`name`, `repository`, `author`).
3. Run `pnpm install`.
4. Build and test:

```bash
pnpm test
pnpm build
```

5. Publish:

```bash
npm publish --access public
```

## License

MIT
