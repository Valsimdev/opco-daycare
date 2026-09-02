interface AlertBoxProps {
  text: string;
}

export function AlertBox({ text }: AlertBoxProps) {
  return (
    <div className="flex gap-[14px] rounded-[16px] bg-[#FBDAD6] p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[#F4A8A0]">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      </div>
      <div>
        <div className="mb-1 text-[15px] font-extrabold text-[#C5413A]">Alergias y notas</div>
        <div className="text-[14.5px] leading-[1.5] text-[#B25249]">{text}</div>
      </div>
    </div>
  );
}
