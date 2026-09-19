"use client";

import { useEffect, useRef, useState } from "react";
import { Kid } from "@/app/_data/mock";

interface SearchBarProps {
  kids: Kid[];
  onResultClick: (id: string) => void;
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function SearchBar({ kids, onResultClick }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const normalized = normalize(query);
  const matches =
    normalized.length > 0
      ? kids.filter((k) => normalize(k.name).includes(normalized))
      : [];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (kid: Kid) => {
    setQuery(kid.name);
    setOpen(false);
    onResultClick(kid.id);
  };

  return (
    <div ref={ref} className="relative mb-[22px]">
      <div className="flex items-center gap-[11px] rounded-[14px] border border-border bg-surface px-4 py-3">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-300"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Buscar niño…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="flex-1 border-none bg-none text-[15px] text-ink-900 placeholder:text-ink-300"
        />
      </div>

      {open && matches.length > 0 && (
        <div className="absolute left-0 right-0 z-30 mt-1 rounded-[14px] border border-border bg-surface shadow-[0_12px_28px_-12px_rgba(63,54,46,0.35)]">
          {matches.map((kid) => (
            <button
              key={kid.id}
              type="button"
              onClick={() => handleSelect(kid)}
              className="flex w-full items-center gap-[12px] px-4 py-3 text-left text-[15px] text-ink-900 transition-colors hover:bg-[#F5EDE2] first:rounded-t-[14px] last:rounded-b-[14px]"
            >
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-semibold"
                style={{ backgroundColor: kid.avatarBg, color: kid.avatarTextColor }}
              >
                {kid.avatarInitial}
              </div>
              <span>
                {kid.name}
                <span className="ml-2 text-[12px] text-ink-400">
                  · {kid.room}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {open && normalized.length > 0 && matches.length === 0 && (
        <div className="absolute left-0 right-0 z-30 mt-1 rounded-[14px] border border-border bg-surface px-4 py-3 text-center text-[14px] text-ink-400 shadow-[0_12px_28px_-12px_rgba(63,54,46,0.35)]">
          Sin resultados para &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
