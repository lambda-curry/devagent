import { existsSync } from "node:fs";
import { join, normalize } from "node:path";

const DEFAULT_PORT = 3000;

function getPort() {
  const raw = process.env.PORT;
  if (!raw) return DEFAULT_PORT;
  const port = Number(raw);
  if (!Number.isFinite(port) || port <= 0) return DEFAULT_PORT;
  return port;
}

const port = getPort();
const clientDir = normalize(join(import.meta.dir, "..", "build", "client"));
const indexPath = join(clientDir, "index.html");

if (!existsSync(indexPath)) {
  console.error(
    `[serve-built] Missing ${indexPath}.\n` +
      "Run `bun run build` first (this runs `react-router build`).",
  );
  process.exit(1);
}

function isUnderClientDir(pathname: string) {
  // Prevent path traversal; keep it simple and strict.
  const resolved = normalize(join(clientDir, pathname));
  return resolved === clientDir || resolved.startsWith(clientDir + "/");
}

function cacheHeadersFor(pathname: string) {
  // React Router build emits fingerprinted assets under /assets/*
  if (pathname.startsWith("/assets/")) {
    return {
      "Cache-Control": "public, max-age=31536000, immutable",
    };
  }

  if (pathname === "/" || pathname.endsWith(".html")) {
    return {
      "Cache-Control": "no-store",
    };
  }

  return {
    "Cache-Control": "public, max-age=3600",
  };
}

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = decodeURIComponent(url.pathname);

    // Only GET/HEAD; everything else is not supported by this static server.
    if (req.method !== "GET" && req.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    // Map URL path to file path under build/client
    const filePath = pathname === "/" ? indexPath : join(clientDir, pathname);

    if (!isUnderClientDir(pathname)) {
      return new Response("Not Found", { status: 404 });
    }

    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file, {
        headers: {
          ...cacheHeadersFor(pathname),
        },
      });
    }

    // SPA fallback: serve index.html for any non-asset path.
    // (If you need SSR, use `react-router-serve ./build/server/index.js` instead.)
    if (!pathname.startsWith("/assets/")) {
      return new Response(Bun.file(indexPath), {
        headers: {
          ...cacheHeadersFor("/index.html"),
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`[serve-built] Serving ${clientDir}`);
console.log(`[serve-built] http://localhost:${port}`);
