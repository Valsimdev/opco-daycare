<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Playwright (MCP)

- Todo lo relacionado con Playwright (screenshots, snapshots, logs, artefactos, etc.) debe guardarse en la carpeta `.playwright-mcp/`, nunca en la raíz del proyecto.
- Los screenshots se guardan en `.playwright-mcp/screenshots/` con la nomenclatura `nombre-de-imagen_año-mes-dia_hora-minuto-segundos.png` (ej. `.playwright-mcp/screenshots/home_2026-08-30_09-39-41.png`).
