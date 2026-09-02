interface InviteCardProps {
  name?: string;
  sala?: string;
  initial?: string;
}

export function InviteCard({
  name = "Mateo",
  sala = "Sala Soles",
  initial = "M",
}: InviteCardProps) {
  return (
    <div className="flex items-center gap-[14px] rounded-2xl border-[1.5px] border-border-soft bg-white p-[14px_16px] mb-[22px]">
      <div className="size-11 rounded-full bg-sky-light text-sky-deep font-display font-semibold text-[19px] flex items-center justify-center">
        {initial}
      </div>
      <div>
        <div className="text-[13px] text-ink-600">
          Te invitaron a seguir a
        </div>
        <div className="font-display font-semibold text-[17px] text-ink-900">
          {name} · {sala}
        </div>
      </div>
    </div>
  );
}
