interface ProfileHeaderProps {
  kid: {
    name: string;
    age: number;
    room: string;
    avatarInitial: string;
    avatarBg: string;
    avatarTextColor: string;
  };
}

export function ProfileHeader({ kid }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-[18px]">
      <div
        className="flex size-[84px] shrink-0 items-center justify-center rounded-full font-display font-semibold"
        style={{ backgroundColor: kid.avatarBg, color: kid.avatarTextColor, fontSize: "34px" }}
      >
        {kid.avatarInitial}
      </div>

      <div className="flex-1">
        <h1 className="m-0 font-display text-[28px] font-semibold text-ink-900">{kid.name}</h1>
        <p className="m-0 mt-1 text-[15px] text-ink-500">
          {kid.age} años · Sala {kid.room}
        </p>
      </div>

      <button
        className="rounded-[12px] border-[1.5px] border-border bg-surface px-4 py-[9px] text-[14px] font-bold text-ink-700"
        disabled
      >
        Editar
      </button>
    </div>
  );
}
