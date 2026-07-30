import { LazyProgressiveImage } from "lazy-progressive-image/react";

export default function App() {
  return (
    <main
      style={{
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: "2rem",
        lineHeight: 1.5,
      }}
    >
      <h1>lazy-progressive-image React example</h1>
      <p>Scroll down to trigger lazy loading.</p>
      <div style={{ height: "120vh" }} />
      <LazyProgressiveImage
        src="https://picsum.photos/id/10/800/600"
        thumbnail="https://picsum.photos/id/10/40/30"
        alt="A forest path"
        style={{
          display: "block",
          width: "100%",
          maxWidth: "600px",
          height: "400px",
          margin: "2rem 0",
        }}
      />
      <div style={{ height: "120vh" }} />
    </main>
  );
}
