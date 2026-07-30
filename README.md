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
2. The full image is not rendered until the wrapper is near/in view (`rootMargin: 100px`).
3. When visible, the thumb (if provided) and full image are rendered.
4. On full image `load`, the component calls `HTMLImageElement.decode()` when available.
5. The full image is shown only after decode completes (or immediately after `load` on browsers without `decode`).

This means visibility controls network/render timing, and `decode()` helps avoid showing a partially decoded full image.

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

## Styling with CSS custom properties

The component exposes a small set of CSS custom properties so you can override its appearance from a parent page without reaching into its internal shadow DOM.

```html
<style>
  lazy-progressive-image {
    --lpi-width: 320px;
    --lpi-height: 220px;
    --lpi-image-border-radius: 0;
    --lpi-image-shadow: none;
    --lpi-thumbnail-blur: 8px;
    --lpi-image-object-fit: contain;
  }
</style>
```

Useful properties include:

- `--lpi-width` and `--lpi-height` for the component box
- `--lpi-image-object-fit`, `--lpi-image-shadow`, `--lpi-image-border-radius`, and `--lpi-image-filter` for the full image
- `--lpi-thumbnail-opacity`, `--lpi-thumbnail-filter`, and `--lpi-thumbnail-blur` for the thumbnail
- `--lpi-image-opacity`, `--lpi-image-transition`, and `--lpi-thumbnail-transition` for transition behavior

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
- `className?: string`

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
