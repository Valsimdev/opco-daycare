"use client";

import { useEffect, useRef, useState } from "react";
import { kids } from "@/app/_data/mock";

const postTypes = [
  { label: "Comida", color: "#9A7B1E", textColor: "#fff" },
  { label: "Siesta", color: "#E7DCF6", textColor: "#7B5FC0" },
  { label: "Actividad", color: "#2E89A6", textColor: "#fff" },
  { label: "Logro", color: "#CFEBD8", textColor: "#3E9B6C" },
  { label: "Ánimo", color: "#F9D2DE", textColor: "#C56486" },
  { label: "Foto", color: "#FBD8CC", textColor: "#D9684A" },
  { label: "Anuncio", color: "#CCD8F4", textColor: "#4E72C8" },
] as const;

export interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSelectedChildren([]);
      setIsAllSelected(false);
      setSelectedType(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleChildToggle = (childId: string) => {
    if (isAllSelected) {
      setIsAllSelected(false);
      setSelectedChildren([childId]);
      return;
    }
    setSelectedChildren((prev) =>
      prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId],
    );
  };

  const handleAllToggle = () => {
    if (selectedChildren.length > 0) {
      setSelectedChildren([]);
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
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
            onClick={onClose}
            className="cursor-pointer text-[15px] font-bold text-ink-500 hover:opacity-80"
          >
            Cancelar
          </button>
          <span className="font-display text-[18px] font-semibold text-ink-900">
            Nueva publicación
          </span>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-[15px] font-extrabold text-coral-800 hover:opacity-80"
          >
            Publicar
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          {/* PARA */}
          <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-ink-500">
            PARA
          </div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {kids.map((child) => {
              const isSelected = selectedChildren.includes(child.id);
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => handleChildToggle(child.id)}
                  className={`flex cursor-pointer items-center gap-2 rounded-full px-2 py-1.5 text-[14px] font-bold transition-all ${
                    isSelected
                      ? "border-[1.5px] border-ink-900 bg-ink-900 text-white"
                      : "border-[1.5px] border-border bg-[#FFFDF9] text-ink-700"
                  }`}
                  style={{ paddingLeft: 6, paddingRight: 14 }}
                >
                  <span
                    className="flex size-[26px] shrink-0 items-center justify-center rounded-full font-display text-[13px] font-semibold"
                    style={{
                      background: child.avatarBg,
                      color: child.avatarTextColor,
                    }}
                  >
                    {child.avatarInitial}
                  </span>
                  {child.name.split(" ")[0]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleAllToggle}
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
            className="mb-[22px] min-h-[120px] w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3.5 text-[15px] leading-[1.5] text-ink-900 placeholder:text-[#B6A99B]"
          />

          {/* FOTOS */}
          <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-ink-500">
            FOTOS
          </div>
          <div className="flex gap-3">
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
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
