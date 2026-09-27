"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPostAction } from "@/app/_actions/post-actions";

const postTypes = [
  { label: "Comida", color: "#9A7B1E", textColor: "#fff" },
  { label: "Siesta", color: "#E7DCF6", textColor: "#7B5FC0" },
  { label: "Actividad", color: "#2E89A6", textColor: "#fff" },
  { label: "Logro", color: "#CFEBD8", textColor: "#3E9B6C" },
  { label: "Ánimo", color: "#F9D2DE", textColor: "#C56486" },
  { label: "Foto", color: "#FBD8CC", textColor: "#D9684A" },
  { label: "Anuncio", color: "#CCD8F4", textColor: "#4E72C8" },
] as const;

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  kids: Array<{ id: string; full_name: string }>;
  roomId: string | null;
  roomName: string;
  childrenCount: number;
  dateLabel: string;
}

export function CreatePostModal({ open, onClose, kids: roomKids, roomId, roomName }: CreatePostModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<Array<{ file: File; preview: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = useCallback(() => {
    setSelectedChildren([]);
    setIsAllSelected(false);
    setSelectedType(null);
    setBody("");
    setPhotos([]);
    setIsSubmitting(false);
    setError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  const handleChildSelect = (childId: string) => {
    setIsAllSelected(false);
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId],
    );
  };

  const handleAllSelect = () => {
    setIsAllSelected((prev) => {
      const newVal = !prev;
      if (newVal) {
        setSelectedChildren([]);
      }
      return newVal;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = files.slice(0, remaining);

    const oversized = toAdd.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      const names = oversized.map((f) => f.name).join(", ");
      setError(`Las imágenes "${names}" superan los 3 MB.`);
    }

    const validFiles = toAdd.filter((f) => f.size <= MAX_FILE_SIZE);

    if (validFiles.length === 0) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setError(null);

    const newPhotos = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPhotos].slice(0, MAX_PHOTOS));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const removed = prev[index];
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    setError(null);

    if (!selectedType) {
      setError("Seleccioná un tipo de publicación.");
      return;
    }

    if (!body.trim()) {
      setError("La descripción no puede estar vacía.");
      return;
    }

    if (!isAllSelected && selectedChildren.length === 0) {
      setError("Seleccioná al menos un niño o toda la sala.");
      return;
    }

    if (photos.length > MAX_PHOTOS) {
      setError(`Máximo ${MAX_PHOTOS} fotos permitidas.`);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("type", selectedType);
    formData.append("body", body);
    formData.append("wholeRoom", isAllSelected ? "true" : "false");
    formData.append("childIds", selectedChildren.join(","));
    formData.append("roomId", roomId ?? "");

    photos.forEach((photo, index) => {
      formData.append(`photo_${index}`, photo.file);
    });

    const result = await createPostAction(formData);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    handleClose();
  };

  const childInitial = (name: string) => name.charAt(0).toUpperCase();

  const AVATAR_COLORS = [
    { bg: "#A9D9E8", textColor: "#1F7A93" },
    { bg: "#F4B8CC", textColor: "#C44A7A" },
    { bg: "#B9DEC4", textColor: "#3E8B62" },
    { bg: "#F4DC8E", textColor: "#9A7B1E" },
    { bg: "#C9B6E8", textColor: "#7B5FC0" },
  ];

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Nueva publicación"
    >
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-[580px] overflow-y-auto rounded-[16px] border border-border bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[24px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="cursor-pointer text-[15px] font-bold text-ink-500 hover:opacity-80 disabled:opacity-50"
          >
            Cancelar
          </button>
          <span className="font-display text-[18px] font-semibold text-ink-900">
            Nueva publicación
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="cursor-pointer text-[15px] font-extrabold text-coral-800 hover:opacity-80 disabled:opacity-50"
          >
            {isSubmitting ? "Publicando..." : "Publicar"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="px-6 py-6">
          {/* PARA */}
          <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-ink-500">
            PARA
          </div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {roomKids.map((child) => {
              const isSelected = selectedChildren.includes(child.id);
              const { bg, textColor } = getAvatarColor(child.full_name);
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => handleChildSelect(child.id)}
                  className={`flex cursor-pointer items-center gap-2 rounded-full px-2 py-1.5 text-[14px] font-bold transition-all ${
                    isSelected
                      ? "border-[1.5px] border-ink-900 bg-ink-900 text-white"
                      : "border-[1.5px] border-border bg-[#FFFDF9] text-ink-700"
                  }`}
                  style={{ paddingLeft: 6, paddingRight: 14 }}
                >
                  <span
                    className="flex size-[26px] shrink-0 items-center justify-center rounded-full font-display text-[13px] font-semibold"
                    style={{ background: bg, color: textColor }}
                  >
                    {childInitial(child.full_name)}
                  </span>
                  {child.full_name.split(" ")[0]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleAllSelect}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-[14px] font-bold transition-all ${
                isAllSelected
                  ? "border-[1.5px] border-ink-900 bg-ink-900 text-white"
                  : "border-[1.5px] border-border bg-[#FFFDF9] text-ink-700"
              }`}
            >
              Toda la sala
            </button>
          </div>

          {/* TIPO */}
          <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-ink-500">
            TIPO
          </div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {postTypes.map((type) => {
              const isSelected = selectedType === type.label;
              return (
                <button
                  key={type.label}
                  type="button"
                  onClick={() => setSelectedType(type.label)}
                  className={`cursor-pointer rounded-full px-4 py-2 text-[13.5px] font-extrabold transition-all ${
                    isSelected
                      ? "ring-2 ring-ink-900 ring-offset-1 ring-offset-[#FBF4EC]"
                      : ""
                  }`}
                  style={{
                    background: type.color,
                    color: type.textColor,
                  }}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* DESCRIPCIÓN */}
          <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-ink-500">
            DESCRIPCIÓN
          </div>
          <textarea
            placeholder="Contá cómo le fue hoy…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mb-[22px] min-h-[120px] w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3.5 text-[15px] leading-[1.5] text-ink-900 placeholder:text-[#B6A99B]"
          />

          {/* FOTOS */}
          <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-ink-500">
            FOTOS {photos.length > 0 && `(${photos.length}/${MAX_PHOTOS})`}
          </div>
          <div className="flex flex-wrap gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative size-[96px]">
                <img
                  src={photo.preview}
                  alt={`Preview ${index + 1}`}
                  className="size-[96px] rounded-[14px] object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <>
                <div className="flex size-[96px] items-center justify-center rounded-[14px] border border-border bg-surface-muted text-[#CBB89F]">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-[96px] flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-border-muted bg-surface-muted text-ink-300 cursor-pointer"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C5503A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-[12px]">Agregar</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
