"use client";

import { useEffect, useState } from "react";

interface LinkParentModalProps {
  open: boolean;
  childName: string;
  onClose: () => void;
}

const INVITATION_CODE = "7K4P9";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RELATIONSHIPS = ["Mamá", "Papá", "Tutor/a"] as const;

export default function LinkParentModal({
  open,
  childName,
  onClose,
}: LinkParentModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    relationship?: string;
  }>({});

  const resetForm = () => {
    setName("");
    setEmail("");
    setRelationship("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSend = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Ingresá un email válido";
    }

    if (!relationship) {
      newErrors.relationship = "Seleccioná un parentesco";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      resetForm();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-10"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-[480px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-[20px]">
          <div>
            <div className="font-display text-[18px] font-semibold text-ink-900">
              Vincular padre
            </div>
            <div className="text-[13px] text-ink-400">a {childName}</div>
          </div>
          <button
            type="button"
            className="flex size-[34px] items-center justify-center rounded-[10px] bg-border-soft text-ink-500 hover:bg-border-strong"
            onClick={handleClose}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form body */}
        <div className="px-[26px] py-[22px]">
          {/* Info box */}
          <div className="mb-5 flex gap-[11px] rounded-[14px] bg-[#E3ECFB] p-[13px_16px]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4E72C8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-px flex-none"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
              Le enviaremos un correo con un código para que active su cuenta.
              Solo verá el feed de {childName}.
            </span>
          </div>

          {/* Name */}
          <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-ink-500">
            NOMBRE DEL PADRE/MADRE
          </label>
          <input
            type="text"
            placeholder="Ej. Diego Fernández"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name && e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            className={`mb-[18px] w-full rounded-[14px] border bg-white px-4 py-[13px] text-[15px] text-ink-900 placeholder:text-[#B6A99B] ${
              errors.name ? "border-red-500" : "border-[#EADFD0]"
            }`}
          />
          {errors.name && (
            <p className="-mt-[14px] mb-[18px] text-[13px] text-red-500">
              {errors.name}
            </p>
          )}

          {/* Email */}
          <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-ink-500">
            EMAIL
          </label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email && EMAIL_REGEX.test(e.target.value)) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            className={`mb-[18px] w-full rounded-[14px] border bg-white px-4 py-[13px] text-[15px] text-ink-900 placeholder:text-[#B6A99B] ${
              errors.email ? "border-red-500" : "border-[#EADFD0]"
            }`}
          />
          {errors.email && (
            <p className="-mt-[14px] mb-[18px] text-[13px] text-red-500">
              {errors.email}
            </p>
          )}

          {/* Relationship */}
          <label className="mb-[10px] block text-[12px] font-extrabold tracking-[0.7px] text-ink-500">
            PARENTESCO
          </label>
          <div className="mb-5 flex gap-[9px]">
            {RELATIONSHIPS.map((rel) => {
              const selected = relationship === rel;
              return (
                <button
                  key={rel}
                  type="button"
                  className={`flex-1 rounded-full border-[1.5px] py-[11px] text-[14px] font-extrabold ${
                    selected
                      ? "border-indigo-deep bg-indigo-light text-indigo-deep"
                      : "border-[#ECE0D0] bg-surface text-ink-700"
                  }`}
                  onClick={() => {
                    setRelationship(rel);
                    if (errors.relationship) {
                      setErrors((prev) => ({
                        ...prev,
                        relationship: undefined,
                      }));
                    }
                  }}
                >
                  {rel}
                </button>
              );
            })}
          </div>
          {errors.relationship && (
            <p className="-mt-[16px] mb-[18px] text-[13px] text-red-500">
              {errors.relationship}
            </p>
          )}

          {/* Invitation code */}
          <div className="mb-5 rounded-[16px] border-[1.5px] border-dashed border-[#E6D08A] bg-[#FBF1D6] p-[18px] text-center">
            <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#A88526]">
              CÓDIGO DE INVITACIÓN
            </div>
            <div className="font-display text-[34px] tracking-[7px] text-[#8A7234]">
              {INVITATION_CODE}
            </div>
            <div className="mt-1 text-[13px] text-[#A88526]">
              Vence en 7 días
            </div>
          </div>

          {/* Submit button */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-b from-coral-500 to-coral-600 py-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
            onClick={handleSend}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4z" />
              <path d="M22 2 11 13" />
            </svg>
            Enviar invitación
          </button>
        </div>
      </div>
    </div>
  );
}
