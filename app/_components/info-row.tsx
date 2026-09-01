interface InfoRowProps {
  label: string;
  value: string;
  last?: boolean;
}

export function InfoRow({ label, value, last }: InfoRowProps) {
  return (
    <div
      className={`flex justify-between px-[18px] py-[15px] ${last ? "" : "border-b border-border-soft"}`}
    >
      <span className="text-[14.5px] text-ink-500">{label}</span>
      <span className="text-[14.5px] font-extrabold text-ink-900">{value}</span>
    </div>
  );
}
