import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export interface PostPhoto {
  url: string;
  width: number | null;
  height: number | null;
  position: number;
}

export interface PostChild {
  id: string;
  full_name: string;
}

export interface PostRow {
  id: string;
  author_id: string;
  author_name: string;
  room_id: string | null;
  type: string;
  title: string | null;
  body: string;
  published_at: string;
  children: PostChild[];
  photos: PostPhoto[];
}

export interface FamilyFeedPostRow {
  id: string;
  author_id: string;
  author_name: string;
  room_id: string | null;
  room_name: string | null;
  type: string;
  title: string | null;
  body: string;
  published_at: string;
  child_name: string | null;
  photos: PostPhoto[];
}

export async function getFamilyFeedPosts(
  parentId: string,
  selectedChildId: string | null,
): Promise<FamilyFeedPostRow[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: parentChildren, error: pcError } = await supabase
    .from("parent_children")
    .select("child_id, children!inner(id, full_name, room_id)")
    .eq("parent_id", parentId);

  if (pcError) {
    console.error("Error fetching parent children:", pcError);
    return [];
  }

  if (!parentChildren || parentChildren.length === 0) {
    return [];
  }

  const allChildIds = parentChildren.map((pc) => pc.child_id);
  const childRoomIds = parentChildren
    .map((pc) => (pc.children as unknown as { room_id: string | null } | null)?.room_id)
    .filter((r): r is string => r != null);

  const targetChildIds = selectedChildId ? [selectedChildId] : allChildIds;

  const targetRoomIds = selectedChildId
    ? parentChildren
        .filter((pc) => pc.child_id === selectedChildId)
        .map((pc) => (pc.children as unknown as { room_id: string | null } | null)?.room_id)
        .filter((r): r is string => r != null)
    : childRoomIds;

  const { data: childPostIds, error: cpiError } = await supabase
    .from("post_children")
    .select("post_id")
    .in("child_id", targetChildIds);

  if (cpiError) {
    console.error("Error fetching child post IDs:", cpiError);
    return [];
  }

  const postIds = childPostIds?.map((pc) => pc.post_id) ?? [];

  const { data: childPosts, error: childError } = postIds.length > 0
    ? await supabase
        .from("posts")
        .select(
          `
          id,
          author_id,
          room_id,
          type,
          title,
          body,
          published_at,
          users!inner(full_name),
          rooms(name),
          post_children(child_id, children(id, full_name)),
          post_photos(id, url, width, height, position)
          `
        )
        .in("id", postIds)
        .order("published_at", { ascending: false })
    : { data: [], error: null };

  if (childError) {
    console.error("Error fetching child posts:", childError);
    return [];
  }

  let announcementQuery = supabase
    .from("posts")
    .select(
      `
      id,
      author_id,
      room_id,
      type,
      title,
      body,
      published_at,
      users!inner(full_name),
      rooms(name),
      post_children(child_id, children(id, full_name)),
      post_photos(id, url, width, height, position)
      `
    )
    .eq("type", "announcement")
    .order("published_at", { ascending: false });

  if (targetRoomIds.length > 0) {
    announcementQuery = announcementQuery.or(`room_id.is.null,room_id.in.(${targetRoomIds.join(",")})`);
  } else {
    announcementQuery = announcementQuery.is("room_id", null);
  }

  const { data: announcementPosts, error: annError } = await announcementQuery;

  if (annError) {
    console.error("Error fetching announcement posts:", annError);
    return [];
  }

  const combined = [...(childPosts ?? []), ...(announcementPosts ?? [])];
  const seen = new Set<string>();
  const deduplicated = combined.filter((row: Record<string, unknown>) => {
    const id = row.id as string;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  }).sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
    const aDate = new Date(a.published_at as string).getTime();
    const bDate = new Date(b.published_at as string).getTime();
    return bDate - aDate;
  });

  return deduplicated.map((row: Record<string, unknown>) => {
    const users = row.users as { full_name: string } | null;
    const rooms = row.rooms as { name: string } | null;
    const postChildren = (row.post_children as Array<{ child_id: string; children: { id: string; full_name: string } | null }> | null) ?? [];
    const photos = (row.post_photos as Array<{ id: string; url: string; width: number | null; height: number | null; position: number }> | null) ?? [];

    const matchedChild = postChildren.find(
      (pc) => pc.children != null && targetChildIds.includes(pc.children.id),
    );

    return {
      id: row.id as string,
      author_id: row.author_id as string,
      author_name: users?.full_name ?? "Desconocido",
      room_id: row.room_id as string | null,
      room_name: rooms?.name ?? null,
      type: row.type as string,
      title: row.title as string | null,
      body: row.body as string,
      published_at: row.published_at as string,
      child_name: matchedChild?.children?.full_name ?? null,
      photos: photos
        .sort((a, b) => a.position - b.position)
        .map((p) => ({
          url: p.url,
          width: p.width,
          height: p.height,
          position: p.position,
        })),
    };
  });
}

export async function getFeedPosts(daycareId: string | null): Promise<PostRow[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!daycareId) {
    return [];
  }

  // Get all room IDs for this daycare
  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("id")
    .eq("daycare_id", daycareId);

  if (roomsError) {
    console.error("Error fetching rooms:", roomsError);
    return [];
  }

  const roomIds = rooms?.map((r) => r.id) ?? [];

  // Get posts for all rooms in the daycare or general announcements
  let query = supabase
    .from("posts")
    .select(
      `
      id,
      author_id,
      room_id,
      type,
      title,
      body,
      published_at,
      users!inner(full_name),
      post_children(child_id, children(id, full_name)),
      post_photos(id, url, width, height, position)
      `
    )
    .order("published_at", { ascending: false });

  if (roomIds.length > 0) {
    const orClause = roomIds.map((id) => `room_id.eq.${id}`).join(",") + ",room_id.is.null";
    query = query.or(orClause);
  } else {
    query = query.is("room_id", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((row: Record<string, unknown>) => {
    const users = row.users as { full_name: string } | null;
    const postChildren = (row.post_children as Array<{ child_id: string; children: { id: string; full_name: string } | null }> | null) ?? [];
    const photos = (row.post_photos as Array<{ id: string; url: string; width: number | null; height: number | null; position: number }> | null) ?? [];

    return {
      id: row.id as string,
      author_id: row.author_id as string,
      author_name: users?.full_name ?? "Desconocido",
      room_id: row.room_id as string | null,
      type: row.type as string,
      title: row.title as string | null,
      body: row.body as string,
      published_at: row.published_at as string,
      children: postChildren
        .filter((pc) => pc.children != null)
        .map((pc) => ({
          id: pc.children!.id,
          full_name: pc.children!.full_name,
        })),
      photos: photos
        .sort((a, b) => a.position - b.position)
        .map((p) => ({
          url: p.url,
          width: p.width,
          height: p.height,
          position: p.position,
        })),
    };
  });
}
