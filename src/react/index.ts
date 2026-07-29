// src/react/index.ts
import React from "react";
import { createComponent } from "@lit/react";
import { LazyProgressiveImage as NativeLazyProgressiveImage } from "../lazy-progressive-image.js";

export const LazyProgressiveImage = createComponent({
  react: React,
  tagName: "lazy-progressive-image",
  elementClass: NativeLazyProgressiveImage,
  events: {
    "image-loaded": "onLoad" as const,
    "image-error": "onError" as const,
  },
});
