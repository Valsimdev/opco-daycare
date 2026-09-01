<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Proyecto

- `open-daycare`: app de gestión para una guardería. Toda la UI, specs y commits van en español.
- Stack: Next.js 16 (App Router en `app/`), TypeScript strict, Tailwind CSS v4 (tema vía `@theme` en `app/globals.css`; no existe ni se crea `tailwind.config`), ESLint 9 con flat config.
- El código en `app/` aún es el boilerplate de create-next-app; no tomarlo como referencia de estilo.

# Diseño (fuente de verdad de la UI)

- `references/pantallas/*.dc.html`: diseño HTML de cada pantalla del producto (login, feed, niños, perfil-niño, resumen-día, avisos, publicaciones, cuenta familiar, vincular-padre, activar cuenta…). `index.dc.html` lista todas.
- `references/screenshots/*.png`: capturas de las pantallas clave.
- Antes de construir una pantalla, leer su `.dc.html`: tipografías (Fredoka/Nunito), paleta cálida y estructura están definidas ahí, no en el código actual.

# Comandos

- `npm run dev` — servidor de desarrollo (http://localhost:3000).
- `npm run lint` — ESLint (se ejecuta sin argumentos).
- `npx tsc --noEmit` — typecheck (no hay script dedicado; `npm run build` también valida tipos).
- `npm run build` / `npm start` — build y servidor de producción.
- No hay framework de tests configurado todavía.

# Flujo de trabajo (skills: Spec Driven Development)

- Desarrollo spec-driven: para features grandes usar el skill `/spec` antes de escribir código; las specs se guardan en `specs/`. Usaremos esta skill o habilidad /spec para crear las especifícaciones.
- Implementar una spec aprobada con el skill `/spec-impl` (crea una rama a partir de la spec). Usaremos esta skill o habilidad /spec-impl para hacer las implementaciones.
- Al terminar una implementación, verificar los criterios de aceptación con el agente `spec-verifier` (`.opencode/agent/spec-verifier.md`): revisa, corrige y marca los checks de la spec usando Playwright, Context7 y visión para comparar screenshots; si todos pasan, cambia su Estado a «Implementado».
- Commits en español, frase corta describiendo el cambio (ver `git log`).

# Playwright (MCP)

- Todo lo relacionado con Playwright (screenshots, snapshots, logs, artefactos, etc.) debe guardarse en la carpeta `.playwright-mcp/`, nunca en la raíz del proyecto.
- Los screenshots se guardan en `.playwright-mcp/screenshots/` con la nomenclatura `nombre-de-imagen_año-mes-dia_hora-minuto-segundos.png` (ej. `.playwright-mcp/screenshots/home_2026-08-30_09-39-41.png`).

# Context7 (MCP)

- Usaremos el MCP de context7 para traer la documentación actualizada del framework y de cualquier otra tecnología con el que se trabaje o se consulte.

# Agentes

- `spec-verifier` (`.opencode/agent/spec-verifier.md`): Verifica, corrige y marca los criterios de aceptación de una spec tras su implementación. Usa Bash (lint/tsc), Playwright MCP (navegación, interacción y screenshots), Context7 (recomendaciones de Next.js/Tailwind) y visión para comparar screenshots con las plantillas `.dc.html`. Se activa al pedir verificar los checks de una spec o al terminar `/spec-impl`.

# Reglas de código

- Siempre desarrollar aplicando las reglas de código limpio. Nombres de archivos, variables, constantes, propiedades, métodos, funciones, etc. que sean en inglés.

# Mantenimiento de este archivo

- Actualizar `AGENTS.md` siempre que se haga algo relevante o que implique grandes cambios: nuevos agentes, comandos, herramientas, convenciones, cambios de stack, flujos de trabajo, etc. Es la fuente de verdad del contexto del proyecto.