import type { Kid } from "@/app/_data/mock";
import Link from "next/link";

interface KidCardProps {
  kid: Kid;
  href?: string;
}

function parentLabel(count: number): string {
  if (count === 0) return "sin padres vinculados";
  if (count === 1) return "1 padre vinculado";
  return `${count} padres vinculados`;
}

export function KidCard({ kid, href }: KidCardProps) {
  const url = href ?? `/kids/${kid.id}`;

  return (
    <Link
      href={url}
      className="flex items-center gap-[14px] rounded-[18px] border border-border bg-surface p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition-[border-color,transform] duration-150 hover:border-[#F2A78E] hover:-translate-y-0.5"
    >
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-full font-display font-semibold"
        style={{ backgroundColor: kid.avatarBg, color: kid.avatarTextColor, fontSize: "19px" }}
      >
        {kid.avatarInitial}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-display text-[16px] font-semibold text-ink-900">{kid.name}</span>
        <span className="text-[13px] text-ink-400">
          {kid.age} años · {parentLabel(kid.parentCount)}
        </span>
      </div>

      {kid.badges.length > 0 && (
        <span
          className="shrink-0 rounded-full px-[9px] py-[5px] text-[11px] font-extrabold"
          style={{ backgroundColor: kid.badges[0].bg, color: kid.badges[0].textColor }}
        >
          {kid.badges[0].label}
        </span>
      )}
    </Link>
  );
}
