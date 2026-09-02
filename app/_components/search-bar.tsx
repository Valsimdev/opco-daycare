"use client";

export function SearchBar() {
  return (
    <div className="flex items-center gap-[11px] rounded-[14px] border border-border bg-surface px-4 py-3 mb-[22px]">
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
        className="flex-1 border-none bg-none text-[15px] text-ink-900 placeholder:text-ink-300"
      />
    </div>
  );
}
