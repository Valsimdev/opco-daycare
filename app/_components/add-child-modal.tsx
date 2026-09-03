"use client";

import { useEffect, useState } from "react";
import { rooms } from "@/app/_data/mock";
import { validateDate } from "@/app/_lib/validate-date";

interface AddChildModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddChildModal({ open, onClose }: AddChildModalProps) {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [room, setRoom] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    birthDate?: string;
    room?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleSave = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "El nombre es obligatorio";
    }

    if (!birthDate.trim()) {
      newErrors.birthDate = "La fecha de nacimiento es obligatoria";
    } else {
      const result = validateDate(birthDate);
      if (!result.valid) {
        newErrors.birthDate = result.message;
      }
    }

    if (!room) {
      newErrors.room = "La sala es obligatoria";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 sm:p-10"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-[520px] rounded-[16px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] sm:mx-4 sm:rounded-[24px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-[20px]">
          <button
            type="button"
            className="text-[15px] font-bold text-[#94887B] hover:underline"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <span className="font-display text-[18px] font-semibold text-ink-900">
            Agregar niño
          </span>
          <button
            type="button"
            className="text-[15px] font-extrabold text-[#D9583C] hover:underline"
            onClick={handleSave}
          >
            Guardar
          </button>
        </div>

        {/* Form */}
        <div className="px-[26px] pb-[26px] pt-[24px]">
          {/* Nombre completo */}
          <label className="mb-[8px] block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            NOMBRE COMPLETO
          </label>
          <input
            type="text"
            placeholder="Ej. Martina López"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`mb-[18px] w-full rounded-[14px] border bg-[#fff] px-4 py-[13px] text-[15px] text-ink-900 placeholder:text-[#B6A99B] ${
              errors.fullName
                ? "border-red-500"
                : "border-[#EADFD0]"
            }`}
          />
          {errors.fullName && (
            <p className="-mt-[14px] mb-[18px] text-[13px] text-red-500">
              {errors.fullName}
            </p>
          )}

          {/* Fecha de nacimiento + Sala */}
          <div className="mb-[18px] flex gap-[14px]">
            <div className="flex-1">
              <label className="mb-[8px] block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                FECHA DE NACIMIENTO
              </label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={`w-full rounded-[14px] border bg-[#fff] px-4 py-[13px] text-[15px] text-ink-900 placeholder:text-[#B6A99B] ${
                  errors.birthDate
                    ? "border-red-500"
                    : "border-[#EADFD0]"
                }`}
              />
              {errors.birthDate && (
                <p className="mt-1 text-[13px] text-red-500">
                  {errors.birthDate}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="mb-[8px] block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                SALA
              </label>
              <div className="relative">
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className={`w-full appearance-none rounded-[14px] border bg-[#fff] px-4 py-[13px] pr-10 text-[15px] text-ink-900 ${
                    !room
                      ? "text-[#B6A99B]"
                      : "font-bold"
                  } ${
                    errors.room
                      ? "border-red-500"
                      : "border-[#EADFD0]"
                  }`}
                >
                  <option value="" disabled>
                    Seleccionar sala
                  </option>
                  {rooms.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B0A290"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              {errors.room && (
                <p className="mt-1 text-[13px] text-red-500">{errors.room}</p>
              )}
            </div>
          </div>

          {/* Alergias */}
          <label className="mb-[8px] block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            ALERGIAS (ETIQUETAS)
          </label>
          <input
            type="text"
            placeholder="Ej. Maní, Lactosa"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="mb-[18px] w-full rounded-[14px] border border-[#EADFD0] bg-[#fff] px-4 py-[13px] text-[15px] text-ink-900 placeholder:text-[#B6A99B]"
          />

          {/* Notas médicas */}
          <label className="mb-[8px] block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            NOTAS MÉDICAS
          </label>
          <textarea
            placeholder="Indicaciones, medicación, contactos…"
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-[14px] border border-[#EADFD0] bg-[#fff] px-4 py-[13px] text-[15px] leading-relaxed text-ink-900 placeholder:text-[#B6A99B]"
          />
        </div>
      </div>
    </div>
  );
}
