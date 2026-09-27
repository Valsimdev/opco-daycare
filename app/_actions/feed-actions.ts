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

export async function getFeedPosts(roomId: string | null): Promise<PostRow[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get posts for the room or general announcements
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
      post_children(child_id, children!inner(id, full_name)),
      post_photos(id, url, width, height, position)
      `
    )
    .order("published_at", { ascending: false });

  if (roomId) {
    query = query.or(`room_id.eq.${roomId},room_id.is.null`);
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
    const postChildren = (row.post_children as Array<{ child_id: string; children: { id: string; full_name: string } }> | null) ?? [];
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
      children: postChildren.map((pc) => ({
        id: pc.children.id,
        full_name: pc.children.full_name,
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
