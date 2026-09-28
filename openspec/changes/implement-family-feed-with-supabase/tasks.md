# Tasks

## 1. Función de consulta para el feed familiar

- [ ] 1.1 Crear `getFamilyFeedPosts` en `app/_actions/feed-actions.ts` que consulte posts filtrados por `parent_id` y `child_id` opcional, incluyendo JOINs con `post_children`, `children`, `users` (autor), `rooms` y `post_photos`. Verificar: `npx tsc --noEmit` sin errores de tipos.
- [ ] 1.2 La función SHALL retornar posts donde `post_children.child_id` esté en los hijos del padre, más anuncios generales (`type = 'announcement'` con `room_id` null o de la sala del hijo). Verificar: consulta SQL correcta con cláusulas OR para anuncios.
- [ ] 1.3 La función SHALL aceptar `parentId: string` y `selectedChildId: string | null` como parámetros. Cuando `selectedChildId` es null, incluir todos los hijos. Verificar: firma de función tipada correctamente con TypeScript strict.

## 2. Prop `roomName` en PostCard

- [ ] 2.1 Agregar prop opcional `roomName?: string` a la interfaz `PostCardProps` en `app/_components/post-card.tsx`. Verificar: `npx tsc --noEmit` sin errores.
- [ ] 2.2 Cuando `roomName` está presente, renderizarlo en la línea de metadata después del autor (formato: `{time} · {authorFirstName} · {roomName}`). Cuando es null/undefined, no mostrar. Verificar: componente renderiza correctamente con y sin `roomName`.
- [ ] 2.3 Actualizar las llamadas existentes a `PostCard` en el feed de staff para no pasar `roomName` (no cambiar comportamiento). Verificar: `/` se ve igual que antes.

## 3. Página del feed familiar con datos reales

- [ ] 3.1 En `app/(family)/family/page.tsx`, reemplazar el uso de `familyPosts` por una llamada a `getFamilyFeedPosts` pasando el `user.id` como `parentId` y el `child` search param como `selectedChildId`. Verificar: `npx tsc --noEmit` sin errores.
- [ ] 3.2 Leer el parámetro `child` de `searchParams` usando `useSearchParams` o `searchParams` del componente servidor. Verificar: `?child=<id>` filtra correctamente, sin parámetro muestra todos.
- [ ] 3.3 Mapear los resultados de la query al formato que `PostCard` espera (`PostCardData`), incluyendo `roomName` cuando el post tiene sala. Verificar: datos renderizados en el feed con nombre de sala visible.
- [ ] 3.4 Preservar el `ChildSelector` con los hijos obtenidos de la BD (ya implementado) y conectar la selección al filtrado. Verificar: clic en hijo actualiza el feed, clic en "Todos" muestra todo.
- [ ] 3.5 Manejar estado vacío: cuando no hay posts, mostrar mensaje amigable "Aún no hay publicaciones para hoy". Verificar: UI muestra mensaje cuando query retorna 0 filas.
- [ ] 3.6 Eliminar o comentar la importación de `familyPosts` desde `family-mock.ts`. Verificar: la página no usa datos mock para posts.

## 4. Verificación y paridad visual

- [ ] 4.1 Ejecutar `npm run lint` y verificar que no hay errores de ESLint. Corregir si es necesario.
- [ ] 4.2 Ejecutar `npx tsc --noEmit` y verificar que no hay errores de TypeScript. Corregir si es necesario.
- [ ] 4.3 Verificar con Playwright que `/family` renderiza sin errores de consola: sidebar, encabezado, selector de hijo, separador y publicaciones con datos reales. Screenshot en `.playwright-mcp/screenshots/family-feed-real-data_YYYY-MM-DD_HH-mm-ss.png`.
- [ ] 4.4 Verificar paridad visual con `references/pantallas/familia-feed.dc.html`: sidebar con "Feed" activo, selector de hijo con botones de avatar, metadata de post con nombre de sala ("Maestra Caro · Sala Soles"), badges de tipo. Ajustar estilos si es necesario.
- [ ] 4.5 Verificar que el feed filtra correctamente: seleccionar un hijo específico muestra solo sus posts + anuncios; "Todos" muestra todo. Screenshot de cada estado.
