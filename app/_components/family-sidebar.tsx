import { logoutAction } from "@/app/_actions/auth-actions";
import { Avatar } from "./avatar";
import { NavLink } from "./nav-link";
import Link from "next/link";

interface FamilySidebarProps {
  userName: string;
  userInitial: string;
  relationship: string | null;
  childrenNames: string[];
}

function formatParentLabel(relationship: string | null, childrenNames: string[]): string {
  if (childrenNames.length === 0) return "";

  const label = relationship === "padre" ? "Papá" : relationship === "madre" ? "Mamá" : "Tutor";
  const kids =
    childrenNames.length === 1
      ? childrenNames[0]
      : childrenNames.length === 2
        ? `${childrenNames[0]} y ${childrenNames[1]}`
        : `${childrenNames[0]}, ${childrenNames[1]} y ${childrenNames.length - 2} más`;

  return `${label} de ${kids}`;
}

export function FamilySidebar({ userName, userInitial, relationship, childrenNames }: FamilySidebarProps) {
  const parentLabel = formatParentLabel(relationship, childrenNames);

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <Link href="/family" className="flex items-center gap-[11px] px-2 pb-[22px] pt-1">
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
          <div className="mt-0.5 text-[11.5px] text-ink-400">Familia</div>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        <NavLink
          href="/family"
          icon={
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
          }
        >
          Feed
        </NavLink>
        <NavLink
          href="/family/resumen-dia"
          icon={
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          }
        >
          Resumen del día
        </NavLink>
        <NavLink
          href="/family/cuenta"
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
          <Avatar initial={userInitial} variant="coral" size="sm" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-ink-900">{userName}</div>
            <div className="truncate text-xs text-ink-400">{parentLabel}</div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-cream text-ink-500"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
