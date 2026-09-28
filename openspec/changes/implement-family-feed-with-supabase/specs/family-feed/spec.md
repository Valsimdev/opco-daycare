# Spec Delta

## Purpose

Permite que los padres vean publicaciones reales de la guardería sobre sus hijos en el feed familiar, filtrando por hijo seleccionado y mostrando información de la sala correspondiente.

## ADDED Requirements

### Requirement: El feed familiar consulta publicaciones reales desde Supabase

El sistema SHALL obtener las publicaciones del feed familiar consultando la base de datos Supabase, en lugar de usar datos mock. Las publicaciones incluyen posts etiquetados con los hijos del padre y anuncios de las salas correspondientes.

#### Scenario: Padre autenticado ve sus publicaciones
- **WHEN** un padre autenticado accede a `/family`
- **THEN** el sistema consulta las publicaciones relacionadas con sus hijos desde Supabase y las muestra en el feed

#### Scenario: Padre sin hijos no ve publicaciones
- **WHEN** un padre autenticado no tiene hijos vinculados en `parent_children`
- **THEN** el feed muestra un estado vacío indicando que no hay publicaciones

### Requirement: El feed filtra publicaciones por hijo seleccionado

El sistema SHALL filtrar las publicaciones cuando el padre selecciona un hijo específico mediante el selector de hijo. Las publicaciones del hijo seleccionado incluyen posts con ese `child_id` en `post_children` y anuncios generales de la sala.

#### Scenario: Selector muestra todos los hijos del padre
- **WHEN** el feed carga con éxito los hijos del padre desde `parent_children`
- **THEN** el `ChildSelector` muestra un botón por cada hijo con su avatar y nombre, más un botón "Todos"

#### Scenario: Padre selecciona un hijo específico
- **WHEN** el padre hace clic en el botón de un hijo en el selector
- **THEN** el feed muestra solo publicaciones de ese hijo (posts con su `child_id` en `post_children`) más anuncios generales (`room_id` null o de su sala)

#### Scenario: Padre selecciona "Todos"
- **WHEN** el padre hace clic en el botón "Todos" del selector
- **THEN** el feed muestra todas las publicaciones de todos sus hijos más anuncios generales

#### Scenario: Selección de hijo persiste en la URL
- **WHEN** el padre selecciona un hijo
- **THEN** la URL incluye el parámetro `?child=<child_id>` para permitir compartir y recargar

### Requirement: Los anuncios generales aparecen en el feed

El sistema SHALL incluir anuncios generales (posts de tipo `announcement` con `room_id` null o de la sala del hijo) en el feed familiar, independientemente del hijo seleccionado.

#### Scenario: Anuncio general visible para todos los padres de la sala
- **WHEN** existe un post de tipo `announcement` con `room_id` null
- **THEN** el anuncio aparece en el feed de todos los padres

#### Scenario: Anuncio de sala visible para padres de esa sala
- **WHEN** existe un post de tipo `announcement` con `room_id` de una sala específica
- **THEN** el anuncio aparece en el feed de los padres que tienen al menos un hijo en esa sala

### Requirement: PostCard muestra nombre de la sala

El componente `PostCard` SHALL aceptar una prop opcional `roomName` que muestra el nombre de la sala cuando está disponible. En el feed familiar, la sala se muestra en la metadata de la publicación (ej. "Maestra Caro · Sala Soles").

#### Scenario: Sala mostrada en publicación con room_id
- **WHEN** una publicación tiene un `room_id` válido con nombre de sala
- **THEN** el PostCard muestra el nombre de la sala en la metadata

#### Scenario: Sin sala en publicación general
- **WHEN** una publicación no tiene `room_id` (anuncio general)
- **THEN** el PostCard no muestra nombre de sala en la metadata

### Requirement: Metadata de publicación incluye autor y sala

El feed familiar SHALL mostrar para cada publicación: nombre del niño (o "Anuncio general"), hora de publicación, nombre del autor (staff) y nombre de la sala si aplica.

#### Scenario: Post de niño específico
- **WHEN** la publicación está etiquetada con un niño
- **THEN** se muestra el nombre del niño, hora, nombre del staff y sala

#### Scenario: Anuncio general
- **WHEN** la publicación es un anuncio general
- **THEN** se muestra "Anuncio general", hora y nombre del staff (sin sala si es general)
