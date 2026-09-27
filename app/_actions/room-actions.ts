import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export interface RoomChild {
  id: string;
  full_name: string;
}

export async function getRoomChildren(roomId: string): Promise<RoomChild[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("children")
    .select("id, full_name")
    .eq("room_id", roomId)
    .eq("status", "active")
    .order("full_name");

  if (error) {
    console.error("Error fetching room children:", error);
    return [];
  }

  return data ?? [];
}

export async function getCurrentUserRoom(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get the user's room via their daycare's rooms
  // Staff users are associated with a daycare, not a specific room
  // We need to find which room to use for the feed
  const { data: userRow, error } = await supabase
    .from("users")
    .select("daycare_id")
    .eq("id", userId)
    .single();

  if (error || !userRow?.daycare_id) {
    return null;
  }

  // Get the first room of the daycare (for now, staff is associated with one room)
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id")
    .eq("daycare_id", userRow.daycare_id)
    .single();

  if (roomError || !room) {
    return null;
  }

  return room.id;
}
