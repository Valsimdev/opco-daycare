"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Ingresá un email válido." };
  }

  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  if (!data.session) {
    return { error: "No se pudo iniciar sesión. Intentá de nuevo." };
  }

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (userError || !userRow) {
    await supabase.auth.signOut();
    return { error: "Usuario no encontrado en el sistema. Contactá al administrador." };
  }

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect("/auth/login");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function activateAccountAction(formData: {
  code: string;
  email: string;
  password: string;
  photoConsent: boolean;
}) {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!formData.code || !formData.email || !formData.password) {
      return { success: false, error: "Todos los campos son obligatorios." };
    }

    if (formData.password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
      .eq("code", formData.code.toUpperCase())
      .maybeSingle();

    if (invitationError) {
      return { success: false, error: "Error al verificar el código." };
    }

    if (!invitation) {
      return { success: false, error: "Código de invitación no encontrado." };
    }

    if (invitation.status !== "pending") {
      return { success: false, error: "Este código ya fue usado o no es válido." };
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: "Este código expiró. Contactá a la guardería." };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      options: {
        data: {
          daycare_id: null,
          role: "parent",
          full_name: invitation.full_name,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user || !authData.session) {
      return { success: false, error: "No se pudo crear la cuenta. Intentá de nuevo." };
    }

    // Set the session for subsequent authenticated calls
    await supabase.auth.setSession({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
    });

    const { error: parentChildError } = await supabase.from("parent_children").insert({
      parent_id: authData.user.id,
      child_id: invitation.child_id,
      relationship: invitation.relationship,
    });

    if (parentChildError) {
      return { success: false, error: "Error al crear el vínculo con el niño." };
    }

    const { error: updateInvitationError } = await supabase
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (updateInvitationError) {
      return { success: false, error: "Error al actualizar la invitación." };
    }

    if (formData.photoConsent) {
      await supabase
        .from("children")
        .update({ photo_consent: true })
        .eq("id", invitation.child_id);
    }

    return { success: true };
  } catch {
    return { success: false, error: "Error inesperado al activar la cuenta." };
  }
}
