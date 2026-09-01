import type { PostType } from "@/app/_data/mock";

interface TagBadgeProps {
  type: PostType;
}

const badgeByType: Record<PostType, { label: string; pillClass: string; accentClass: string }> = {
  achievement: { label: "LOGRO", pillClass: "bg-green-light", accentClass: "text-green-deep" },
  activity: { label: "ACTIVIDAD", pillClass: "bg-blue-light", accentClass: "text-blue-deep" },
  announcement: { label: "ANUNCIO", pillClass: "bg-indigo-light", accentClass: "text-indigo-deep" },
};

export function TagBadge({ type }: TagBadgeProps) {
  const badge = badgeByType[type];
  return (
    <div
      className={`flex items-center gap-[7px] rounded-full px-3 py-1.5 ${badge.pillClass} ${badge.accentClass}`}
    >
      <span className="size-2 rounded-full bg-current" />
      <span className="text-xs font-extrabold tracking-[0.5px]">{badge.label}</span>
    </div>
  );
}
