# Proposal

## Why

El feed familiar (`/family`) actualmente usa datos mock (`familyPosts` de `app/_data/family-mock.ts`) para mostrar las publicaciones. Aunque la página ya conecta a Supabase para autenticación y obtener los hijos del padre, las publicaciones siguen siendo ficticias. Esto impide que los padres vean contenido real de la guardería y bloquea el flujo completo del producto.

## What Changes

- Reemplazar `familyPosts` (datos mock) por queries reales a Supabase que traigan publicaciones filtradas por los hijos del padre autenticado
- El feed debe incluir: posts con `child_id` de los hijos del padre + announcements de las salas correspondientes
- El selector de hijo (`ChildSelector`) debe filtrar las publicaciones: cuando se selecciona un hijo específico, mostrar solo sus posts + anuncios generales; "Todos" muestra todo
- Agregar prop `roomName` al componente `PostCard` para mostrar el nombre de la sala en el feed familiar (ej. "Sala Soles")
- Crear función `getFamilyFeedPosts` en `feed-actions.ts` que consulte posts filtrados por parent_id y child_id opcional
- Preservar el diseño visual de `familia-feed.dc.html` (sidebar, selector de hijo, tarjetas de publicación)

## Capabilities

### New Capabilities
- `family-feed`: Feed del padre con publicaciones reales filtradas por sus hijos. El padre ve posts etiquetados con sus hijos y anuncios de las salas correspondientes. Incluye selector de hijo para filtrar y prop `roomName` en PostCard para info de sala.

### Modified Capabilities

## Impact

- `app/(family)/family/page.tsx`: deja de usar `familyPosts` del mock, usa queries reales
- `app/_actions/feed-actions.ts`: nueva función `getFamilyFeedPosts` para queries del feed familiar
- `app/_components/post-card.tsx`: prop opcional `roomName` para mostrar nombre de sala
- `app/_data/family-mock.ts`: `familyPosts` deja de usarse en la página (se puede mantener para otros usos o eliminar)
- `app/_components/child-selector.tsx`: posiblemente ajustar para pasar child_id a la query
- Tablas de Supabase: `posts`, `post_children`, `parent_children`, `rooms`, `users`
