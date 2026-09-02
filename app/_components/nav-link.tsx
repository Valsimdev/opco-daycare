"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  icon: ReactNode;
  children: ReactNode;
  href?: string;
}

export function NavLink({ icon, children, href }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href ? pathname === href || (href !== "/" && pathname.startsWith(href)) : false;

  const stateClass = isActive
    ? "bg-peach text-coral-800 font-extrabold"
    : "text-ink-700 font-semibold";

  const className = `flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] ${stateClass}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <div className={className}>
      {icon}
      {children}
    </div>
  );
}
