# Design

## Context

See `proposal.md` for motivation. The current state:

- `app/(family)/family/page.tsx` already connects to Supabase for auth and fetches children via `parent_children`, but uses mock data (`familyPosts` from `family-mock.ts`) for posts
- `app/_actions/feed-actions.ts` has `getFeedPosts(daycareId)` for the staff feed, querying posts by room IDs within a daycare
- `app/_components/post-card.tsx` renders posts but doesn't have a `roomName` prop; it uses mock data shapes
- `app/_components/child-selector.tsx` handles child selection via URL search params (`?child=<id>`)
- `references/pantallas/familia-feed.dc.html` shows the target design with child selector buttons, room info in post metadata ("Maestra Caro · Sala Soles")

## Goals / Non-Goals

**Goals:**
- Replace mock posts with real Supabase queries in the family feed
- Filter posts by selected child using the existing `ChildSelector` component
- Add `roomName` prop to `PostCard` for displaying room information
- Include announcements (general and room-specific) in the feed
- Preserve the existing visual design from `familia-feed.dc.html`

**Non-Goals:**
- Changing the auth flow or user onboarding
- Modifying the staff feed (`/`)
- Adding new database tables or changing the schema
- Implementing reactions or comments interaction
- Changing the sidebar or mobile navigation

## Decisions

### 1. Data fetching: Server Component with direct Supabase queries

**Decision:** Query Supabase directly in the Server Component (`FamilyFeedPage`) rather than creating a separate API route or Edge Function.

**Rationale:** The current page already uses `createClient` from `utils/supabase/server` for auth and children queries. Keeping post queries in the same Server Component maintains consistency, reduces round trips, and leverages Next.js server-side rendering.

**Alternatives considered:**
- Create a new API route (`/api/family-feed`): adds latency, complexity, and an extra network hop
- Use an Edge Function: overkill for simple SELECT queries with RLS

### 2. Query structure: Single query with JOINs

**Decision:** Fetch posts with a single query that JOINs `posts`, `post_children`, `children`, `users` (author), `rooms`, and `post_photos`. Filter by parent's children via a subquery on `parent_children`.

**Rationale:** The DB schema already supports this via `post_children` as the intermediary. A single query with proper JOINs is more efficient than multiple queries and matches the pattern in `getFeedPosts`.

**Query logic:**
- Get all child IDs from `parent_children` where `parent_id = user.id`
- Fetch posts where: (`post_children.child_id` IN parent's children) OR (`type = 'announcement'` AND (`room_id` IS NULL OR `room_id` IN children's rooms))
- Include room name via JOIN on `rooms` table

### 3. Child filtering: URL param drives query filter

**Decision:** When `?child=<child_id>` is present, filter the query to only that child's posts + general announcements. When absent or "all", show all children's posts.

**Rationale:** The `ChildSelector` already uses URL search params. Reading the param in the Server Component and passing it to the query function keeps the filtering server-side and avoids client-side filtering of large datasets.

### 4. PostCard `roomName` prop: Optional string

**Decision:** Add an optional `roomName?: string` prop to `PostCard`. When provided, render it in the metadata line (e.g., `{time} · {author} · {roomName}`). When null/undefined, omit it.

**Rationale:** The staff feed (`/`) doesn't need room name in PostCard since the sidebar already shows the room. The family feed needs it per-post because parents may have children in different rooms. Making it optional avoids breaking existing usage.

### 5. Room name resolution: JOIN in the post query

**Decision:** Resolve room names in the same query that fetches posts, not as a separate lookup.

**Rationale:** One query is simpler and avoids N+1 problems. The room name is a simple JOIN on `posts.room_id → rooms.name`.

## Risks / Trade-offs

| Risk | Mitigation |
| --- | --- |
| RLS policies may block parent from seeing posts | Ensure RLS on `posts` and `post_children` allows parent access via `parent_children` relationship |
| Query performance with many posts/photos | Add indexes on `post_children(child_id)`, `posts(room_id, type)`, `posts(published_at)` |
| PostCard mock data compatibility | Keep the existing `PostCardData` interface working; `roomName` is additive |
| No posts for new parents (empty state) | Show a friendly empty state when query returns zero rows |
