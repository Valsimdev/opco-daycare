"use server";

import { createClient as createAnonClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function validateActivationCode(code: string) {
  const supabase = createAnonClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("invitations")
    .select(`
      id,
      child_id,
      full_name,
      email,
      relationship,
      status,
      expires_at,
      children ( full_name, room_id, rooms ( name ) )
    `)
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error) {
    return { valid: false, error: "Error al verificar el código." };
  }

  if (!data) {
    return { valid: false, error: "Código no encontrado." };
  }

  if (data.status !== "pending") {
    return {
      valid: false,
      error:
        data.status === "accepted"
          ? "Este código ya fue usado. La cuenta ya está activa."
          : "Este código ya no es válido.",
    };
  }

  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "Este código expiró. Contactá a la guardería." };
  }

  const child = data.children as unknown as {
    full_name: string;
    room_id: string;
    rooms: { name: string };
  } | null;

  const childName = child?.full_name || "";
  const roomName = child?.rooms?.name || "";

  return {
    valid: true,
    childName,
    roomName,
    email: data.email,
    relationship: data.relationship,
  };
}
