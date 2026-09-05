"use client";

import { useState } from "react";
import { classroom, profile } from "@/app/_data/mock";
import { Avatar } from "./avatar";
import { NavLink } from "./nav-link";
import Link from "next/link";
import { CreatePostModal } from "./create-post-modal";

export function Sidebar() {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  return (
    <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <Link href="/" className="flex items-center gap-[11px] px-2 pb-[22px] pt-1">
        <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(155deg,var(--color-coral-300),var(--color-coral-400))]">
          <svg
            aria-hidden="true"
            width="21"
            height="21"
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
        <div>
          <div className="font-display text-[17px] font-semibold leading-none text-ink-900">OpenDayCare</div>
          <div className="mt-0.5 text-[11.5px] text-ink-400">Sala {classroom.name}</div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => setShowCreatePostModal(true)}
        className="mb-[18px] flex w-full items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,var(--color-coral-500),var(--color-coral-600))] p-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
      >
        <svg
          aria-hidden="true"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nueva publicación
      </button>
      <CreatePostModal open={showCreatePostModal} onClose={() => setShowCreatePostModal(false)} />

      <nav className="flex flex-1 flex-col gap-1">
        <NavLink
          href="/"
          icon={
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
          }
        >
          Feed
        </NavLink>
        <NavLink
          href="/kids"
          icon={
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="7" r="3" />
              <circle cx="17" cy="9" r="2.4" />
              <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
            </svg>
          }
        >
          Niños
        </NavLink>
        <NavLink
          href="/avisos"
          icon={
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
          }
        >
          Avisos
        </NavLink>
        <NavLink
          href="/mi-cuenta"
          icon={
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        >
          Mi cuenta
        </NavLink>
      </nav>

      <div className="mt-2.5 border-t border-border pt-3.5">
        <div className="flex items-center gap-[11px] px-2 py-1.5">
          <Avatar initial={profile.initial} variant="coral" size="sm" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-ink-900">{profile.name}</div>
            <div className="text-xs text-ink-400">{profile.role}</div>
          </div>
          <Link
            href="/login"
            title="Cerrar sesión"
            className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-cream text-ink-500"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
}
