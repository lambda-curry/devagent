const port = Number(process.env.PORT ?? 3000);

if (!Number.isFinite(port) || port <= 0) {
  console.error("[preview-funnel] Invalid PORT");
  process.exit(1);
}

console.log(`[preview-funnel] Starting Tailscale Funnel for http://localhost:${port}`);
console.log(
  "[preview-funnel] Note: this makes your preview publicly reachable. Use with care.",
);

// `tailscale funnel <port>` will print the public URL if Funnel is enabled.
// If your Tailscale version differs, see README for alternatives.
const proc = Bun.spawn({
  cmd: ["tailscale", "funnel", String(port)],
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

const code = await proc.exited;
process.exit(code);
