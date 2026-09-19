"use client";

import { useState } from "react";
import { Kid } from "@/app/_data/mock";
import { KidCard } from "@/app/_components/kid-card";
import { SearchBar } from "@/app/_components/search-bar";
import { SectionHeader } from "@/app/_components/section-header";
import AddChildModal from "@/app/_components/add-child-modal";

export default function KidsPageClient({
  kids,
  roomName,
  rooms,
}: {
  kids: Kid[];
  roomName: string;
  rooms: { id: string; name: string }[];
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);

  const handleChildCreated = () => {
    window.location.reload();
  };

  const displayedKids = selectedKidId
    ? kids.filter((k) => k.id === selectedKidId)
    : kids;

  const handleSearchResult = (id: string) => {
    setSelectedKidId(id);
  };

  const handleClearSearch = () => {
    setSelectedKidId(null);
  };

  return (
    <div className="mx-auto w-full max-w-[880px] px-10 py-9 max-md:px-4 max-md:py-6">
      <div className="mb-[22px] flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-coral-800">
            GESTIÓN
          </div>
          <h1 className="m-0 font-display text-[30px] font-semibold text-ink-900">Niños</h1>
        </div>
        <button
          className="flex items-center gap-2 rounded-[14px] bg-gradient-to-b from-coral-500 to-coral-600 px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
          onClick={() => setShowAddModal(true)}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar niño
        </button>
      </div>

      <SearchBar kids={kids} onResultClick={handleSearchResult} />

      {selectedKidId && (
        <button
          onClick={handleClearSearch}
          className="mb-3 flex items-center gap-2 text-[14px] font-bold text-coral-800 hover:underline"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Volver a la lista completa
        </button>
      )}

      <SectionHeader room={roomName} count={displayedKids.length} />

      <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
        {displayedKids.map((kid) => (
          <KidCard key={kid.id} kid={kid} />
        ))}
      </div>

      <AddChildModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onChildCreated={handleChildCreated}
        rooms={rooms}
      />
    </div>
  );
}
