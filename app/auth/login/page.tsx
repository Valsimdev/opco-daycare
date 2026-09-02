import { AuthLogo } from "@/app/_components/auth-logo";
import { AuthField } from "@/app/_components/auth-field";
import { AuthButton } from "@/app/_components/auth-button";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-[#FBF4EC]">
      {/* Left branding panel */}
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-gradient-to-br from-[#F6A98E] via-coral-400 to-[#EC7E62] p-[56px_60px] text-white">
        {/* Decorative circles */}
        <div className="absolute size-[420px] rounded-full bg-white/10 -top-[140px] -right-[120px]" />
        <div className="absolute size-[300px] rounded-full bg-white/10 -bottom-[110px] -left-[80px]" />

        {/* Logo */}
        <div className="relative">
          <AuthLogo />
        </div>

        {/* Title and description */}
        <div className="relative">
          <h1 className="font-display text-[42px] font-semibold leading-[1.12] mb-[18px]">
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p className="text-[17px] leading-[1.6] max-w-[430px] text-white/[0.92]">
            Publicá momentos, gestioná las salas y mantené a las familias cerca, desde un solo lugar.
          </p>
        </div>

        {/* Badge */}
        <div className="relative text-[14px] text-white/90">
          🌿 Guardería Sala Soles
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-[40px_20px] lg:p-[40px]">
        <div className="w-full max-w-[392px]">
          <h2 className="font-display text-[30px] font-semibold mb-1.5 text-ink-900">
            Iniciar sesión
          </h2>
          <p className="mb-7 text-ink-600 text-[15px]">
            Ingresá para ver el día de hoy.
          </p>

          {/* "INGRESO COMO" section — hidden but present */}
          <div style={{ display: "none" }}>
            <div className="mb-2 text-xs font-extrabold tracking-wider text-ink-600 uppercase">
              INGRESO COMO
            </div>
            <div className="flex gap-2.5 mb-[22px]">
              <button
                type="button"
                className="flex flex-1 items-center gap-[9px] rounded-[14px] border-[1.5px] border-coral-400 bg-peach p-3 text-[14px] font-extrabold text-coral-700"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Personal
              </button>
              <button
                type="button"
                className="flex flex-1 items-center gap-[9px] rounded-[14px] border-[1.5px] border-border-soft bg-white p-3 text-[14px] font-extrabold text-ink-700"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Familia
              </button>
            </div>
          </div>

          {/* Email */}
          <AuthField
            label="Email"
            type="email"
            value="caro@opendaycare.com"
          />

          {/* Password */}
          <AuthField
            label="Contraseña"
            type="password"
            placeholder="••••••••"
          />

          {/* Forgot password link */}
          <div className="text-right mb-5">
            <a href="#" className="text-coral-900 text-[13.5px] font-extrabold cursor-pointer">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Login button */}
          <AuthButton>
            Iniciar sesión
          </AuthButton>

          {/* Activate account link */}
          <p className="mt-6 text-center text-[14.5px] text-ink-600">
            ¿Te invitó la guardería?{" "}
            <a href="/auth/activate" className="text-coral-900 font-extrabold">
              Activá tu cuenta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
