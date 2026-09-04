import { kids } from "@/app/_data/mock";
import Link from "next/link";
import KidProfileClient from "./kid-profile-client";

export default function KidProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return <KidProfileWrapper params={params} />;
}

async function KidProfileWrapper({ params }: { params: Promise<{ id: string }> }) {
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

  return <KidProfileClient kid={kid} />;
}
