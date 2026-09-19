import { validateActivationCode } from "@/app/_actions/activation-actions";
import { InviteCard } from "@/app/_components/invite-card";
import { ActivateForm } from "./activate-form";
import Link from "next/link";

export default async function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF4EC] px-5 py-10">
        <div className="w-full max-w-[440px] text-center">
          <div className="size-[58px] rounded-[18px] bg-gradient-to-br from-coral-300 to-coral-400 flex items-center justify-center mx-auto mb-[22px] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </div>
          <h1 className="font-display font-semibold text-[32px] leading-[1.15] mb-2 text-ink-900">
            Activar cuenta
          </h1>
          <p className="mb-[26px] text-ink-600 text-[15.5px] leading-[1.55]">
            No se proporcionó un código de invitación.
          </p>
          <Link
            href="/auth/login"
            className="text-coral-900 font-extrabold text-[16px]"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  const result = await validateActivationCode(code);

  if (!result.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF4EC] px-5 py-10">
        <div className="w-full max-w-[440px] text-center">
          <div className="size-[58px] rounded-[18px] bg-gradient-to-br from-coral-300 to-coral-400 flex items-center justify-center mx-auto mb-[22px] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </div>
          <h1 className="font-display font-semibold text-[32px] leading-[1.15] mb-2 text-ink-900">
            Código inválido
          </h1>
          <p className="mb-4 text-ink-600 text-[15.5px] leading-[1.55]">
            {result.error}
          </p>
          <p className="text-ink-500 text-[14px]">
            Si crees que es un error, contactá a la guardería o{" "}
            <Link
              href="/auth/login"
              className="text-coral-900 font-extrabold"
            >
              iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF4EC] px-5 py-10">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="size-[58px] rounded-[18px] bg-gradient-to-br from-coral-300 to-coral-400 flex items-center justify-center mb-[22px] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </div>

        {/* Title & subtitle */}
        <h1 className="font-display font-semibold text-[32px] leading-[1.15] mb-2 text-ink-900">
          Bienvenida a OpenDayCare
        </h1>
        <p className="mb-[26px] text-ink-600 text-[15.5px] leading-[1.55]">
          Te invitaron a seguir el día de tu hijo. Creá tu contraseña para activar la cuenta.
        </p>

        {/* Invite card */}
        <InviteCard
          name={result.childName || ""}
          sala={`Sala ${result.roomName || ""}`}
          initial={result.childName ? result.childName.charAt(0).toUpperCase() : "?"}
        />

        {/* Activate form */}
        <ActivateForm
          code={code.toUpperCase()}
          email={result.email || ""}
        />

        {/* Login link */}
        <p className="mt-[22px] text-center text-[14.5px] text-ink-600">
          ¿Ya tenés cuenta?{" "}
          <a href="/auth/login" className="text-coral-900 font-extrabold">
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
}
