"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRandomCode(): string {
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
  }
  return result;
}

export async function generateInvitationCode(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = generateRandomCode();
      const { data, error } = await supabase
        .from("invitations")
        .select("id")
        .eq("code", code)
        .maybeSingle();

      if (error) {
        return null;
      }

      if (!data) {
        isUnique = true;
        return code;
      }
      attempts++;
    }

    return null;
  } catch {
    return null;
  }
}

export async function linkParentAction(formData: {
  childId: string;
  fullName: string;
  email: string;
  relationship: "father" | "mother" | "guardian";
}) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "No autenticado. Iniciá sesión de nuevo." };
    }

    if (!formData.childId || !formData.fullName.trim() || !formData.email.trim() || !formData.relationship) {
      return { success: false, error: "Todos los campos son obligatorios." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return { success: false, error: "Ingresá un email válido." };
    }

    const code = await generateInvitationCode();
    if (!code) {
      return { success: false, error: "No se pudo generar el código de invitación. Intentá de nuevo." };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: childData, error: childError } = await supabase
      .from("children")
      .select("full_name")
      .eq("id", formData.childId)
      .single();

    if (childError || !childData) {
      return { success: false, error: "Niño no encontrado." };
    }

    const { error: insertError } = await supabase.from("invitations").insert({
      child_id: formData.childId,
      invited_by: user.id,
      full_name: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      relationship: formData.relationship,
      code,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return { success: false, error: "El código ya existe. Intentá de nuevo." };
      }
      return { success: false, error: insertError.message };
    }

    if (RESEND_API_KEY) {
      const resend = new Resend(RESEND_API_KEY);
      const activateUrl = `${APP_URL}/activate?code=${code}`;

      await resend.emails.send({
        from: "OpenDayCare <onboarding@resend.dev>",
        to: [formData.email.trim().toLowerCase()],
        subject: "Te han invitado a OpenDayCare",
        html: `
          <div style="font-family: 'Fredoka', 'Nunito', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FFFDF7; border-radius: 16px;">
            <h1 style="color: #E1851E; font-size: 24px; margin-bottom: 16px;">¡Bienvenido/a a OpenDayCare!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Has sido invitado/a para ser padre/tutor de <strong>${childData.full_name}</strong> en la guardería.
            </p>
            <div style="background: #FDF3E0; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="color: #666; font-size: 14px; margin: 0 0 8px;">Tu código de activación:</p>
              <p style="color: #E1851E; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0;">${code}</p>
            </div>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Para activar tu cuenta, haz clic en el siguiente enlace o ingresa el código en la página de activación:
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${activateUrl}" style="display: inline-block; background: #E1851E; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Activar mi cuenta
              </a>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 24px;">
              Este código expira en 7 días. Si no esperabas este mensaje, puedes ignorarlo.
            </p>
          </div>
        `,
      });
    }

    revalidatePath(`/kids/${formData.childId}`);

    return { success: true };
  } catch {
    return { success: false, error: "Error inesperado al enviar la invitación." };
  }
}
