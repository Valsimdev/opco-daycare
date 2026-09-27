const badgeByType: Record<string, { label: string; pillClass: string; accentClass: string }> = {
  achievement: { label: "LOGRO", pillClass: "bg-green-light", accentClass: "text-green-deep" },
  activity: { label: "ACTIVIDAD", pillClass: "bg-blue-light", accentClass: "text-blue-deep" },
  announcement: { label: "ANUNCIO", pillClass: "bg-indigo-light", accentClass: "text-indigo-deep" },
  meal: { label: "COMIDA", pillClass: "bg-orange-light", accentClass: "text-orange-deep" },
  nap: { label: "SIESTA", pillClass: "bg-purple-light", accentClass: "text-purple-deep" },
  mood: { label: "ÁNIMO", pillClass: "bg-yellow-light", accentClass: "text-yellow-deep" },
  photo: { label: "FOTO", pillClass: "bg-pink-light", accentClass: "text-pink-deep" },
};

const defaultBadge = { label: "POST", pillClass: "bg-gray-light", accentClass: "text-gray-deep" };

interface TagBadgeProps {
  type: string;
}

export function TagBadge({ type }: TagBadgeProps) {
  const badge = badgeByType[type] ?? defaultBadge;
  return (
    <div
      className={`flex items-center gap-[7px] rounded-full px-3 py-1.5 ${badge.pillClass} ${badge.accentClass}`}
    >
      <span className="size-2 rounded-full bg-current" />
      <span className="text-xs font-extrabold tracking-[0.5px]">{badge.label}</span>
    </div>
  );
}
