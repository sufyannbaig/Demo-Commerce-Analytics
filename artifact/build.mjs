// Bundles the dashboard into one self-contained HTML file (used for the shareable presentation link).
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const shim = path.join(root, "artifact/router.tsx");
const result = await build({
  entryPoints: [path.join(root, "artifact/entry.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  write: false,
  jsx: "automatic",
  target: "es2020",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: { "next/link": shim, "next/navigation": shim, "@": path.join(root, "src") },
  logLevel: "warning",
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const cssDir = path.join(root, ".next/static/css");
const css = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css")).map((f) => fs.readFileSync(path.join(cssDir, f), "utf8")).join("\n");

const html = `<title>Demo Commerce Analytics</title>
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap">
<style>
${css}
/* single light theme by design: the dashboard sets every colour itself */
:root { color-scheme: light; --font-geist-sans: "Geist", ui-sans-serif, system-ui, sans-serif; --font-geist-mono: "Geist Mono", ui-monospace, monospace; }
html, body { background: var(--background); }
header.sticky { top: env(safe-area-inset-top, 0px); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
</style>
<div id="root"></div>
<script>${js}</script>
`;
fs.mkdirSync(path.join(root, "artifact/dist"), { recursive: true });
fs.writeFileSync(path.join(root, "artifact/dist/demo-commerce-analytics.html"), html);
console.log("wrote", (html.length / 1024).toFixed(0) + " KB");
