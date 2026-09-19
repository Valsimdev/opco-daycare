"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthField } from "@/app/_components/auth-field";
import { AuthButton } from "@/app/_components/auth-button";
import { activateAccountAction } from "@/app/_actions/auth-actions";

interface ActivateFormProps {
  code: string;
  email: string;
}

export function ActivateForm({
  code,
  email,
}: ActivateFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [photoConsent, setPhotoConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const result = await activateAccountAction({
      code,
      email,
      password,
      photoConsent,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/auth/login?activated=1");
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Invitation code */}
      <div className="mb-[18px]">
        <div className="mb-2 text-xs font-extrabold tracking-wider text-ink-600 uppercase">
          CÓDIGO DE INVITACIÓN
        </div>
        <input
          value={code}
          readOnly
          className="w-full rounded-[14px] border-[1.5px] border-border-soft bg-white px-4 py-3.5 text-[18px] tracking-[3px] font-extrabold text-ink-900 font-display"
        />
      </div>

      {/* Email */}
      <AuthField label="EMAIL" type="email" value={email} />

      {/* Password */}
      <AuthField
        label="CREAR CONTRASEÑA"
        type="password"
        value={password}
        onChange={setPassword}
        variant={password ? "focus" : "default"}
      />

      {/* Checkbox authorization */}
      <label className="flex items-start gap-3 bg-[#FBF1D6] rounded-[14px] p-[14px_16px] mb-6 cursor-pointer">
        <span
          className={`flex-none size-6 rounded-lg flex items-center justify-center mt-[1px] cursor-pointer transition-colors ${
            photoConsent ? "bg-[#5FB97E]" : "bg-[#E0D6CC] border border-[#C0B6AC]"
          }`}
          onClick={(e) => {
            e.preventDefault();
            setPhotoConsent(!photoConsent);
          }}
        >
          {photoConsent && (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <input
          type="checkbox"
          checked={photoConsent}
          onChange={(e) => setPhotoConsent(e.target.checked)}
          className="hidden"
        />
        <span className="text-[14px] leading-[1.45] text-[#8A7234]">
          Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro de la app.
        </span>
      </label>

      {/* Error message */}
      {error && (
        <div className="mb-5 text-[13.5px] text-red-600 font-semibold text-center">
          {error}
        </div>
      )}

      {/* Submit button */}
      <AuthButton type="submit" disabled={loading}>
        {loading ? "Activando..." : "Activar mi cuenta"}
      </AuthButton>
    </form>
  );
}
