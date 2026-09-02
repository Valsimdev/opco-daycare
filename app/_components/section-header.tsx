interface SectionHeaderProps {
  room: string;
  count: number;
}

export function SectionHeader({ room, count }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-[14px]">
      <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-ink-900">
        SALA {room.toUpperCase()}
      </span>
      <span className="text-[13px] text-ink-400">{count} niños</span>
      <div className="h-px flex-1 bg-border-strong" />
    </div>
  );
}
