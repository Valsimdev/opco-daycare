"use client";

import { useState } from "react";
import { profile } from "@/app/_data/mock";
import { Avatar } from "./avatar";
import { Sidebar } from "./sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex size-9 cursor-pointer items-center justify-center rounded-[10px] bg-cream text-ink-500"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-display text-[17px] font-semibold text-ink-900">OpenDayCare</span>
        <div className="ms-auto">
          <Avatar initial={profile.initial} variant="coral" size="sm" />
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-900/40"
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      ) : null}
    </>
  );
}
