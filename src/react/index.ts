// src/react/index.ts
import * as React from "react";
import { LazyProgressiveImage as NativeLazyProgressiveImage } from "../lazy-progressive-image.js";

export interface LazyProgressiveImageProps {
  src?: string;
  thumbnail?: string;
  alt?: string;
  rootMargin?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: (event: Event) => void;
  onError?: (event: Event) => void;
}

// @lit/react's createComponent only forwards reactive properties through a
// channel that requires a patched React.createElement, which silently drops
// src/thumbnail/alt in plain React apps. Assign them imperatively via ref
// instead, so they always reach the custom element regardless of React version.
export const LazyProgressiveImage = React.forwardRef<
  NativeLazyProgressiveImage,
  LazyProgressiveImageProps
>(function LazyProgressiveImage(
  { src, thumbnail, alt, rootMargin, className, style, onLoad, onError },
  forwardedRef,
) {
  const elementRef = React.useRef<NativeLazyProgressiveImage | null>(null);

  const setRef = React.useCallback(
    (node: NativeLazyProgressiveImage | null) => {
      elementRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  React.useLayoutEffect(() => {
    if (elementRef.current) elementRef.current.src = src;
  }, [src]);

  React.useLayoutEffect(() => {
    if (elementRef.current) elementRef.current.thumbnail = thumbnail;
  }, [thumbnail]);

  React.useLayoutEffect(() => {
    if (elementRef.current && alt !== undefined) elementRef.current.alt = alt;
  }, [alt]);

  React.useLayoutEffect(() => {
    if (elementRef.current && rootMargin !== undefined) {
      elementRef.current.rootMargin = rootMargin;
    }
  }, [rootMargin]);

  React.useEffect(() => {
    const el = elementRef.current;
    if (!el || (!onLoad && !onError)) return;
    const handleLoad = (event: Event) => onLoad?.(event);
    const handleError = (event: Event) => onError?.(event);
    if (onLoad) el.addEventListener("image-loaded", handleLoad);
    if (onError) el.addEventListener("image-error", handleError);
    return () => {
      if (onLoad) el.removeEventListener("image-loaded", handleLoad);
      if (onError) el.removeEventListener("image-error", handleError);
    };
  }, [onLoad, onError]);

  return React.createElement("lazy-progressive-image", {
    ref: setRef,
    ...(className !== undefined ? { class: className } : {}),
    ...(style !== undefined ? { style } : {}),
  });
});
