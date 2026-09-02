import { AuthButton } from "@/app/_components/auth-button";
import { InviteCard } from "@/app/_components/invite-card";
import { AuthField } from "@/app/_components/auth-field";

export default function ActivatePage() {
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
        <InviteCard name="Mateo" sala="Sala Soles" initial="M" />

        {/* Invitation code */}
        <div className="mb-[18px]">
          <div className="mb-2 text-xs font-extrabold tracking-wider text-ink-600 uppercase">
            Código de invitación
          </div>
          <input
            defaultValue="7K4P9"
            readOnly
            className="w-full rounded-[14px] border-[1.5px] border-border-soft bg-white px-4 py-3.5 text-[18px] tracking-[3px] font-extrabold text-ink-900 font-display"
          />
        </div>

        {/* Email */}
        <AuthField
          label="Email"
          type="email"
          value="lucia.fernandez@gmail.com"
        />

        {/* Password */}
        <AuthField
          label="Crear contraseña"
          type="password"
          value="contraseña"
          variant="focus"
        />

        {/* Checkbox authorization */}
        <label className="flex items-start gap-3 bg-[#FBF1D6] rounded-[14px] p-[14px_16px] mb-6 cursor-pointer">
          <span className="flex-none size-6 rounded-lg bg-[#5FB97E] flex items-center justify-center mt-[1px]">
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
          </span>
          <span className="text-[14px] leading-[1.45] text-[#8A7234]">
            Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro de la app.
          </span>
        </label>

        {/* Activate button */}
        <AuthButton href="/">
          Activar mi cuenta
        </AuthButton>

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
