<script setup lang="ts">
import { LazyProgressiveImage } from "lazy-progressive-image";
</script>

<template>
  <main
    style="
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
        Roboto, sans-serif;
      margin: 2rem;
      line-height: 1.5;
    "
  >
    <h1>lazy-progressive-image Vue example</h1>
    <p>Scroll down to trigger lazy loading.</p>
    <div style="height: 120vh"></div>
    <lazy-progressive-image
      src="https://picsum.photos/id/10/800/600"
      thumbnail="https://picsum.photos/id/10/40/30?blur=2"
      alt="A forest path"
      root-margin="100px"
      style="
        display: block;
        width: 100%;
        max-width: 600px;
        height: 400px;
        margin: 2rem 0;
      "
    ></lazy-progressive-image>
    <div style="height: 120vh"></div>
  </main>
</template>
