import { kids } from "@/app/_data/mock";
import { ProfileHeader } from "@/app/_components/profile-header";
import { AlertBox } from "@/app/_components/alert-box";
import { InfoRow } from "@/app/_components/info-row";
import { ParentList } from "@/app/_components/parent-list";
import Link from "next/link";

export default function KidProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return <KidProfileContent params={params} />;
}

async function KidProfileContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kid = kids.find((k) => k.id === id);

  if (!kid) {
    return (
      <div className="mx-auto w-full max-w-[820px] px-10 py-9 max-md:px-4 max-md:py-6">
        <Link
          href="/kids"
          className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-ink-500"
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
            <path d="m15 18-6-6 6-6" />
          </svg>
          Volver a Niños
        </Link>
        <div className="text-center py-12">
          <p className="text-lg text-ink-700">Niño no encontrado.</p>
          <Link href="/kids" className="text-coral-800 font-bold mt-4 inline-block">
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[820px] px-10 py-9 max-md:px-4 max-md:py-6">
      <Link
        href="/kids"
        className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-ink-500"
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
          <path d="m15 18-6-6 6-6" />
        </svg>
        Volver a Niños
      </Link>

      <div className="flex flex-col md:flex-row gap-[26px] items-start">
        {/* Left column */}
        <div className="flex-1 min-w-[300px] flex flex-col gap-[18px]">
          <ProfileHeader kid={kid} />

          {kid.allergies && <AlertBox text={kid.allergies} />}

          <div className="rounded-[16px] border border-border bg-surface overflow-hidden">
            <InfoRow label="Fecha de nacimiento" value={kid.birthDate} />
            <InfoRow label="Sala" value={kid.room} />
            <InfoRow label="Ingreso" value={kid.enrollmentDate} last />
          </div>
        </div>

        {/* Right column */}
        <div className="w-[300px] shrink-0 flex flex-col gap-[14px] max-md:w-full">
          <button
            className="flex items-center justify-center gap-[9px] w-full rounded-[14px] bg-ink-900 px-[13px] py-[13px] text-[15px] font-extrabold text-white"
            disabled
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            Resumen del día
          </button>

          <ParentList parents={kid.parents} />
        </div>
      </div>
    </div>
  );
}
