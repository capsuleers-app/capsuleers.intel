// Demo mode only (npm run demo): serves the REAL renderer with the in-memory preload mock
// (demo-api.js) injected. Never shipped: excluded from the package in electron-builder.yml.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.env.PORT) || 5198;
const TYPES = { ".html": "text/html", ".png": "image/png", ".svg": "image/svg+xml", ".js": "text/javascript", ".css": "text/css" };

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p === "/") p = "/src/renderer/index.html";
    const file = normalize(join(ROOT, p));
    if (!file.startsWith(ROOT) || /node_modules/.test(file)) { res.writeHead(403).end(); return; }
    let body = await readFile(file);
    if (file.endsWith("index.html")) {
      const tag = '<script src="/demo/demo-api.js"></script>';
      body = Buffer.from(body.toString("utf8").replace(/\n(\s*)<script>\n/, `\n$1${tag}\n$1<script>\n`));
    }
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" }).end(body);
  } catch { res.writeHead(404).end(); }
}).listen(PORT, "127.0.0.1", () => console.log(`Demo on http://127.0.0.1:${PORT}`));
