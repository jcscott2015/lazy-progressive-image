<script lang="ts">
  import "lazy-progressive-image";
</script>

<main
  style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 2rem; line-height: 1.5;"
>
  <h1>lazy-progressive-image Svelte example</h1>
  <p>Scroll down to trigger lazy loading.</p>
  <div style="height: 120vh;"></div>
  <lazy-progressive-image
    src="https://picsum.photos/id/10/800/600"
    thumbnail="https://picsum.photos/id/10/40/30"
    alt="A forest path"
    root-margin="100px"
    style="display: block; width: 100%; max-width: 600px; height: 400px; margin: 2rem 0;"
  ></lazy-progressive-image>
  <div style="height: 120vh;"></div>
</main>
