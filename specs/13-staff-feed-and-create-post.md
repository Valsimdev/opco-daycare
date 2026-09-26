# SPEC 13 — Staff feed + crear publicación con DB

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 06, SPEC 07, SPEC 08, SPEC 11
> **Fecha:** 2026-09-25
> **Objetivo:** Conectar el feed de staff con Supabase: migraciones para `posts`, `post_children`, `post_photos`; modal de crear publicación con persistencia real, upload de 1-3 fotos a Storage, y feed que carga publicaciones reales con carousel de fotos.

## Por qué existe esta spec

SPEC 01 y SPEC 06 implementaron el feed y el modal con datos mock sin persistencia. Esta spec convierte eso en funcionalidad real: las publicaciones se guardan en la BD, las fotos se suben a Supabase Storage, y el feed muestra posts reales cargados desde la base de datos.

## Alcance

**In:**

- **Migraciones nuevas:**
  - Enum `post_type` con valores: `meal`, `nap`, `activity`, `achievement`, `mood`, `photo`, `announcement`.
  - Tabla `posts` (author_id, room_id, type, title, body, published_at, created_at, updated_at).
  - Tabla `post_children` (post_id, child_id — PK compuesta).
  - Tabla `post_photos` (post_id, url, width, height, position, created_at).
  - Bucket de Storage `post-photos` con límite 3 MB por archivo.
  - RLS en todas las tablas nuevas.

- **Modal "Nueva publicación" (crear-publicacion):**
  - Selección de niños: un niño, múltiples niños, o "Toda la sala".
  - "Toda la sala" deselecciona cualquier niño individual previamente seleccionado.
  - Selección de tipo: 7 categorías (Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio).
  - Textarea de descripción.
  - Upload de 1-3 fotos (máx. 3 MB cada una).
  - Al publicar: valida que haya al menos un destino (niño(s) o toda la sala), sube fotos a Storage, crea el post en DB.

- **Feed de staff:**
  - Carga publicaciones reales desde DB para la sala del usuario staff.
  - Ordenadas por `published_at` DESC, agrupadas por día.
  - Cada publicación muestra: avatar, título, hora, tipo (badge), texto, destinatarios.
  - **Fotos en el feed:**
    - 0 fotos → solo texto, como diseño actual.
    - 1 foto → imagen estática sin flechas.
    - 2-3 fotos → carousel con flechas overlay (estilo Instagram), navegable por click y arrastre del mouse.
  - Estado vacío: solo se muestra "Compartí un momento…" (sin mensaje adicional).

**Fuera de alcance (futuras specs):**

- Likes y comentarios.
- Editar publicaciones existentes.
- Borrar publicaciones.
- Feed de familia/padres (ya cubierto por otra spec).
- Preview de fotos antes de subir.
- Validación de tamaño de imagen en el cliente con mensaje de error detallado.

## Modelo de datos

### Nuevas tablas

```sql
-- Enum post_type
CREATE TYPE post_type AS ENUM ('meal', 'nap', 'activity', 'achievement', 'mood', 'photo', 'announcement');

-- Tabla posts
CREATE TABLE posts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id      uuid REFERENCES rooms(id) ON DELETE SET NULL,
    type         post_type NOT NULL,
    title        text,
    body         text NOT NULL,
    published_at timestamptz NOT NULL DEFAULT now(),
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Tabla post_children
CREATE TABLE post_children (
    post_id  uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, child_id)
);

-- Tabla post_photos
CREATE TABLE post_photos (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id   uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    url       text NOT NULL,
    width     int,
    height    int,
    position  int NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

Traducción de enums a UI (español):

| DB value       | UI label  |
| -------------- | --------- |
| `meal`         | Comida    |
| `nap`          | Siesta    |
| `activity`     | Actividad |
| `achievement`  | Logro     |
| `mood`         | Ánimo     |
| `photo`        | Foto      |
| `announcement` | Anuncio   |

### RLS

```sql
-- posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- Staff: puede leer y escribir posts de su sala/daycare
CREATE POLICY "Staff can read posts from their daycare" ON posts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.daycare_id = posts.room_id
            -- or posts.room_id IS NULL for general announcements
        )
        OR posts.room_id IS NULL
    );
CREATE POLICY "Staff can create posts" ON posts
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'staff'
        )
    );

-- post_children
ALTER TABLE post_children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read post_children" ON post_children
    FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "Staff can insert post_children" ON post_children
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- post_photos
ALTER TABLE post_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read post_photos" ON post_photos
    FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "Staff can insert post_photos" ON post_photos
    FOR INSERT TO authenticated
    WITH CHECK (true);
```

### Bucket de Storage

- Nombre: `post-photos`
- Límite: 3 MB por archivo
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`
- RLS: lectura para authenticated, escritura para staff

## Modelo de datos TypeScript

```ts
interface Post {
    id: string;
    author_id: string;
    author_name: string;
    author_initial: string;
    room_id: string | null;
    type: PostType;
    title: string | null;
    body: string;
    published_at: string;
    children: { id: string; full_name: string; initial: string }[];
    photos: { url: string; width?: number; height?: number; position: number }[];
}

type PostType = 'meal' | 'nap' | 'activity' | 'achievement' | 'mood' | 'photo' | 'announcement';
```

## Plan de implementación

### Paso 1: Migraciones de DB

1. Crear migración `supabase/migrations/YYYYMMDDHHMMSS_create_posts_and_related.sql`:
   - Enum `post_type` con 7 valores (incluyendo `mood`).
   - Tablas `posts`, `post_children`, `post_photos` con FKs y constraints.
   - RLS en todas las tablas.
   - Políticas RLS para staff (read/write) y lectura de post_photos.
2. Aplicar migración con `supabase_apply_migration`.
3. Verificar: tablas existen en `supabase_list_tables`.

### Paso 2: Bucket de Storage

1. Crear bucket `post-photos` vía Supabase MCP o dashboard.
2. Configurar límite de 3 MB y tipos MIME permitidos.
3. Crear políticas RLS del bucket: lectura para authenticated, escritura para staff.
4. Verificar: bucket aparece en lista y acepta uploads de imágenes.

### Paso 3: Server Actions para posts

1. Crear `app/_actions/post-actions.ts`:
   - `createPostAction(formData)`: recibe datos del modal (tipo, body, children seleccionados, fotos).
   - Valida: al menos un destino (niño(s) o toda la sala), body no vacío.
   - Si hay fotos: subir cada una a `post-photos` bucket vía `supabase.storage.from('post-photos').upload()`.
   - Insertar post en `posts`.
   - Si hay niños seleccionados: insertar en `post_children` (uno por cada niño).
   - Si es "toda la sala": no insertar en `post_children` (se interpreta como post general de sala).
   - Retornar `{ success: boolean; error?: string }`.

2. Crear `app/_actions/feed-actions.ts`:
   - `getFeedPosts(roomId)`: obtiene posts de la sala + anuncios generales.
   - Join con `users` para obtener autor (nombre, inicial).
   - Join con `post_children` para obtener niños etiquetados.
   - Join con `post_photos` para obtener URLs de fotos.
   - Ordenar por `published_at DESC`.
   - Retornar `Post[]`.

### Paso 4: Actualizar modal `CreatePostModal`

1. Editar `app/_components/create-post-modal.tsx`:
   - Cargar niños reales desde DB (vía Server Component o fetch client-side).
   - Selección múltiple: mantener array de selected child IDs.
   - "Toda la sala" → clear selección individual, setear flag `wholeRoom = true`.
   - Upload de fotos: máximo 3, validar tamaño ≤ 3 MB en cliente.
   - Preview de fotos seleccionadas (thumbnails).
   - Al publicar: llamar `createPostAction`, mostrar loading state, cerrar modal en éxito.

### Paso 5: Página del feed

1. Editar `app/(staff)/page.tsx`:
   - Server Component: obtener usuario autenticado, su `room_id`, llamar `getFeedPosts(roomId)`.
   - Renderizar posts reales (no mock).
   - Agrupar posts por día ("PUBLICADO HOY", "AYER", fechas específicas).
   - Estado vacío: solo mostrar "Compartí un momento…" (sin posts).

### Paso 6: PostCard con carousel

1. Editar `app/_components/post-card.tsx`:
   - Recibir fotos del post.
   - 0 fotos → sin sección de fotos.
   - 1 foto → `<img>` estática, ancho completo de la tarjeta.
   - 2-3 fotos → carousel:
     - Contenedor con `overflow: hidden`.
     - Flechas overlay izquierda/derecha (estilo Instagram: semi-transparentes, hover más opaco).
     - Navegación por click en flechas y arrastre del mouse (drag).
     - Indicador de posición (dots) en la parte inferior del carousel.
     - `"use client"` para interactividad.

### Paso 7: Integración sidebar

1. El sidebar ya tiene el botón que abre el modal (SPEC 06).
2. El modal ahora persiste en DB (en vez de solo cerrar).
3. Tras publicar exitosamente, revalidar el feed (`revalidatePath('/')`).

### Paso 8: Verificación

1. `npm run lint` + `npx tsc --noEmit`.
2. Playwright screenshots:
   - Feed con posts y fotos estáticas.
   - Feed con carousel de 2-3 fotos.
   - Modal abierto con selección múltiple de niños.
   - Modal con fotos seleccionadas (thumbnails).
   - Estado vacío del feed.
3. Guardar screenshots en `.playwright-mcp/screenshots/`.

## Criterios de aceptación

- [ ] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] La migración se aplica sin errores y crea las tablas `posts`, `post_children`, `post_photos` y enum `post_type` con 7 valores.
- [ ] RLS habilitado en `posts`, `post_children`, `post_photos`.
- [ ] Bucket `post-photos` creado con límite 3 MB y tipos MIME permitidos.
- [ ] El modal "Nueva publicación" carga niños reales desde DB.
- [ ] Se puede seleccionar un solo niño en "Para".
- [ ] Se pueden seleccionar múltiples niños en "Para".
- [ ] Al presionar "Toda la sala" se deseleccionan todos los niños individuales.
- [ ] Se pueden seleccionar 1-3 fotos (máx 3 MB cada una) con preview de thumbnails.
- [ ] Al publicar se guarda el post en DB, se suben fotos a Storage y se crean registros en `post_children`.
- [ ] El feed carga publicaciones reales desde DB.
- [ ] Posts ordenados por `published_at DESC` y agrupados por día.
- [ ] Publicación con 0 fotos: muestra solo texto, sin sección de imagen.
- [ ] Publicación con 1 foto: muestra imagen estática sin flechas.
- [ ] Publicación con 2-3 fotos: muestra carousel con flechas overlay navegables por click y drag.
- [ ] Estado vacío del feed: solo muestra "Compartí un momento…" sin posts ni mensajes adicionales.
- [ ] Screenshots de verificación guardados en `.playwright-mcp/screenshots/`.

## Decisiones

- **Sí:** 1-3 fotos máximo por publicación (confirmación del usuario).
- **Sí:** carousel solo para 2+ fotos, 1 foto = estática, 0 = sin imagen.
- **Sí:** flechas overlay estilo Instagram (confirmación del usuario).
- **Sí:** "Toda la sala" deselecciona niños individuales (confirmación del usuario).
- **Sí:** bucket `post-photos` con límite 3 MB (confirmación del usuario).
- **Sí:** migraciones incluyen RLS obligatorio (reglas del proyecto).
- **Sí:** enum `post_type` incluye `mood` (confirmación del usuario).
- **Sí:** solo feed de staff (`feed.dc.html`), ignorar `familia-feed.dc.html` (confirmación del usuario).
- **No:** likes, comentarios, editar/borrar posts en esta spec.
- **No:** preview de fotos antes de subir (se maneja con thumbnails tras selección).
- **No:** feed de padres (separado en otra spec).

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| RLS bloquea escritura de staff | Políticas bien definidas con `auth.uid()` check; verificar con advisor de seguridad |
| Upload de fotos grandes falla silenciosamente | Validación de 3 MB en cliente antes de intentar upload |
| Carousel no funciona en móvil | Implementar con touch events además de mouse drag |
| `room_id` nullable en posts | Manejar posts sin sala (anuncios generales) correctamente en query |
| Fotos sin `width/height` afectan layout del carousel | Valores por defecto o cálculo asíncrono tras carga de imagen |

## Lo que **no** está en esta spec

- Likes y comentarios (otra spec).
- Editar/borrar publicaciones (otra spec).
- Feed de padres/familia (otra spec).
- Notificaciones push (otra spec).
- Pantallas "Resumen del día" ni demás del índice.

Cada una de esas, si llega, va en su propia spec.
