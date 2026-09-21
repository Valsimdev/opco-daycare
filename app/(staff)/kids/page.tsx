import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { mapChildToKid } from "@/app/_lib/db-types";
import KidsPageClient from "./kids-page-client";

export default async function KidsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: children } = await supabase
    .from("children")
    .select(`
      id,
      room_id,
      full_name,
      birth_date,
      enrolled_at,
      medical_notes,
      allergy_tags,
      photo_consent,
      status,
      rooms!inner ( name )
    `)
    .eq("status", "active")
    .order("full_name");

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name")
    .order("name");

  const typedChildren = (children as unknown as {
    id: string;
    room_id: string;
    full_name: string;
    birth_date: string;
    enrolled_at: string;
    medical_notes: string | null;
    allergy_tags: string[] | null;
    photo_consent: boolean;
    status: "active" | "archived";
    rooms: { name: string } | null;
  }[])
    ?.filter((r) => r.rooms && r.rooms.name)
    .map((r) => ({
      id: r.id,
      full_name: r.full_name,
      birth_date: r.birth_date,
      enrolled_at: r.enrolled_at,
      medical_notes: r.medical_notes,
      allergy_tags: r.allergy_tags,
      photo_consent: r.photo_consent,
      status: r.status,
      room_name: r.rooms!.name,
    })) || [];

  const kids = typedChildren.map((r) => mapChildToKid(r));
  const roomName = kids.length > 0 ? kids[0].room : "Soles";

  return (
    <KidsPageClient
      kids={kids}
      roomName={roomName}
      rooms={rooms || []}
    />
  );
}
