"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const ALLERGY_TRANSLATE: Record<string, string> = {
  maní: "peanut",
  mani: "peanut",
  lactosa: "lactose",
  gluten: "gluten",
  huevo: "egg",
  soya: "soy",
  soja: "soy",
  mariscos: "shellfish",
  pescado: "fish",
  nuez: "nut",
  nueces: "nut",
};

function translateAllergies(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean)
    .map((a) => ALLERGY_TRANSLATE[a] || a);
}

export async function createChild(formData: {
  fullName: string;
  birthDate: string;
  room: string;
  allergies: string;
  medicalNotes: string;
}) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Convert dd/mm/yyyy to YYYY-MM-DD
    const parts = formData.birthDate.split("/");
    if (parts.length !== 3) {
      return { success: false, error: "Formato de fecha inválido. Use dd/mm/aaaa" };
    }
    const [day, month, year] = parts;
    const sqlDate = `${year}-${month}-${day}`;

    // Get room_id from room name
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id")
      .eq("name", formData.room)
      .single();

    if (roomError || !room) {
      return { success: false, error: "Sala no encontrada" };
    }

    const allergyTags = translateAllergies(formData.allergies);

    const { error } = await supabase.from("children").insert({
      room_id: room.id,
      full_name: formData.fullName.trim(),
      birth_date: sqlDate,
      enrolled_at: new Date().toISOString().split("T")[0],
      medical_notes: formData.medicalNotes.trim() || null,
      allergy_tags: allergyTags.length > 0 ? allergyTags : null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Error inesperado al crear el niño" };
  }
}

export async function getRooms() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("rooms")
    .select("id, name")
    .order("name");

  if (error) {
    return [];
  }

  return data as { id: string; name: string }[];
}

export async function getChildren() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
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
      rooms ( name )
    `)
    .eq("status", "active")
    .order("full_name");

  if (error) {
    return [];
  }

  return (data as unknown as {
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
    .filter((r) => r.rooms && r.rooms.name)
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
    }));
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getChildById(slugOrId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
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
    .eq("status", "active");

  if (error || !data) {
    return null;
  }

  const match = (data as { full_name: string; id: string }[]).find(
    (r) => slugify(r.full_name) === slugOrId || r.id === slugOrId
  );

  if (!match) return null;

  const row = match as {
    id: string;
    full_name: string;
    birth_date: string;
    enrolled_at: string;
    medical_notes: string | null;
    allergy_tags: string[] | null;
    photo_consent: boolean;
    status: string;
    rooms: { name: string } | null;
  };

  const room = row.rooms;
  if (!room || !room.name) return null;

  return {
    id: row.id,
    full_name: row.full_name,
    birth_date: row.birth_date,
    enrolled_at: row.enrolled_at,
    medical_notes: row.medical_notes,
    allergy_tags: row.allergy_tags,
    photo_consent: row.photo_consent,
    status: row.status as "active" | "archived",
    room_name: room.name,
  };
}
