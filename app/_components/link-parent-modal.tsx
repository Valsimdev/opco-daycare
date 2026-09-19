"use client";

import { useEffect, useState, useCallback } from "react";
import { generateInvitationCode, linkParentAction } from "@/app/_actions/parent-actions";

const RELATIONSHIP_MAP: Record<string, "father" | "mother" | "guardian"> = {
  Mamá: "mother",
  Papá: "father",
  "Tutor/a": "guardian",
};
const RELATIONSHIPS = ["Mamá", "Papá", "Tutor/a"] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿñÑ\s]*$/;

interface LinkParentModalProps {
  open: boolean;
  childId: string;
  childName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LinkParentModal({
  open,
  childId,
  childName,
  onClose,
  onSuccess,
}: LinkParentModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    relationship?: string;
    form?: string;
  }>({});
  const [invitationCode, setInvitationCode] = useState("");
  const [sending, setSending] = useState(false);

  const loadCode = useCallback(async () => {
    try {
      const code = await generateInvitationCode();
      setInvitationCode(code);
    } catch {
      setInvitationCode("----");
    }
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setRelationship("");
    setErrors({});
    setInvitationCode("");
    setSending(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    loadCode();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, loadCode]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleNameChange = (value: string) => {
    if (!NAME_REGEX.test(value)) return;
    setName(value);
    if (errors.name && value.replace(/\s/g, "").length >= 3) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleSend = async () => {
    setErrors({});
    setSending(true);

    const newErrors: typeof errors = {};

    if (!name.trim() || name.replace(/\s/g, "").length < 3) {
      newErrors.name = "El nombre es obligatorio";
    } else if (!NAME_REGEX.test(name)) {
      newErrors.name = "El nombre solo puede contener letras";
    }

    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Ingresá un email válido";
    }

    if (!relationship) {
      newErrors.relationship = "Seleccioná un parentesco";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSending(false);
      return;
    }

    const result = await linkParentAction({
      childId,
      fullName: name,
      email,
      relationship: RELATIONSHIP_MAP[relationship],
    });

    setSending(false);

    if (result.error) {
      setErrors({ form: result.error });
      return;
    }

    resetForm();
    onClose();
    if (onSuccess) {
      onSuccess();
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
            className="flex size-[34px] cursor-pointer items-center justify-center rounded-[10px] bg-border-soft text-ink-500 hover:bg-border-strong"
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
            onChange={(e) => handleNameChange(e.target.value)}
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
                  className={`flex-1 cursor-pointer rounded-full border-[1.5px] py-[11px] text-[14px] font-extrabold ${
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
            <div className="font-display text-[34px] font-bold tracking-[7px] text-[#8A7234]">
              {invitationCode || "----"}
            </div>
            <div className="mt-1 text-[13px] text-[#A88526]">
              Vence en 7 días
            </div>
          </div>

          {/* Form error */}
          {errors.form && (
            <p className="mb-4 text-center text-[13px] text-red-500">
              {errors.form}
            </p>
          )}

          {/* Submit button */}
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-gradient-to-b from-coral-500 to-coral-600 py-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSend}
            disabled={sending}
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
            {sending ? "Enviando..." : "Enviar invitación"}
          </button>
        </div>
      </div>
    </div>
  );
}
