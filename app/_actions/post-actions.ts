"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTOS = 3;

const POST_TYPE_MAP: Record<string, "meal" | "nap" | "activity" | "achievement" | "mood" | "photo" | "announcement"> = {
  Comida: "meal",
  Siesta: "nap",
  Actividad: "activity",
  Logro: "achievement",
  Ánimo: "mood",
  Foto: "photo",
  Anuncio: "announcement",
};

export async function createPostAction(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "No autenticado." };
    }

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("id, role, full_name")
      .eq("id", user.id)
      .single();

    if (userError || !userRow || userRow.role !== "staff") {
      return { success: false, error: "Solo el staff puede crear publicaciones." };
    }

    const typeLabel = formData.get("type") as string;
    const body = formData.get("body") as string;
    const wholeRoom = formData.get("wholeRoom") === "true";
    const childIdsRaw = formData.get("childIds") as string;
    const roomId = formData.get("roomId") as string | null;

    const postType = POST_TYPE_MAP[typeLabel];
    if (!postType) {
      return { success: false, error: "Tipo de publicación inválido." };
    }

    if (!body || body.trim().length === 0) {
      return { success: false, error: "La descripción no puede estar vacía." };
    }

    if (!wholeRoom && (!childIdsRaw || childIdsRaw.trim().length === 0)) {
      return { success: false, error: "Seleccioná al menos un niño o toda la sala." };
    }

    const childIds: string[] = childIdsRaw
      ? childIdsRaw.split(",").map((id) => id.trim()).filter(Boolean)
      : [];

    // Handle photo uploads
    const photoFiles: File[] = [];
    const keys = Array.from(formData.keys());
    for (const key of keys) {
      if (key.startsWith("photo_")) {
        const file = formData.get(key);
        if (file instanceof File && file.size > 0) {
          photoFiles.push(file);
        }
      }
    }

    if (photoFiles.length > MAX_PHOTOS) {
      return { success: false, error: `Máximo ${MAX_PHOTOS} fotos permitidas.` };
    }

    for (const file of photoFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: `La imagen "${file.name}" supera los 3 MB.` };
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { success: false, error: `Tipo de archivo no permitido: ${file.type}. Solo se aceptan JPEG, PNG y WebP.` };
      }
    }

    // Upload photos to Storage
    const photoUrls: { url: string; width?: number; height?: number }[] = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("post-photos")
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) {
        return { success: false, error: `Error al subir la foto: ${uploadError.message}` };
      }

      const { data: urlData } = supabase.storage
        .from("post-photos")
        .getPublicUrl(uploadData.path);

      photoUrls.push({ url: urlData.publicUrl });
    }

    // Insert the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        author_id: userRow.id,
        room_id: roomId || null,
        type: postType,
        title: typeLabel,
        body: body.trim(),
      })
      .select()
      .single();

    if (postError) {
      return { success: false, error: `Error al crear la publicación: ${postError.message}` };
    }

    // Insert post_children if specific children selected
    if (!wholeRoom && childIds.length > 0) {
      const rows = childIds.map((childId) => ({
        post_id: post.id,
        child_id: childId,
      }));

      const { error: pcError } = await supabase.from("post_children").insert(rows);
      if (pcError) {
        return { success: false, error: `Error al vincular niños: ${pcError.message}` };
      }
    }

    // Insert post_photos
    if (photoUrls.length > 0) {
      const photoRows = photoUrls.map((photo, index) => ({
        post_id: post.id,
        url: photo.url,
        width: photo.width,
        height: photo.height,
        position: index,
      }));

      const { error: photoError } = await supabase.from("post_photos").insert(photoRows);
      if (photoError) {
        return { success: false, error: `Error al guardar fotos: ${photoError.message}` };
      }
    }

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Error inesperado al crear la publicación." };
  }
}
