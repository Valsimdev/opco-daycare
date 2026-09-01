import type { ReactNode } from "react";

interface NavLinkProps {
  icon: ReactNode;
  children: ReactNode;
  href?: string;
  active?: boolean;
}

export function NavLink({ icon, children, href, active = false }: NavLinkProps) {
  const stateClass = active
    ? "bg-peach text-coral-800 font-extrabold"
    : "text-ink-700 font-semibold";

  return (
    <a
      href={href}
      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] ${stateClass}`}
    >
      {icon}
      {children}
    </a>
  );
}
