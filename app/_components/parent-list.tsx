import type { Parent } from "@/app/_data/mock";

interface ParentListProps {
  parents: Parent[];
}

export function ParentList({ parents }: ParentListProps) {
  return (
    <div className="rounded-[16px] border border-border bg-surface p-[18px]">
      <div className="mb-[14px] text-[12.5px] font-extrabold tracking-[0.8px] text-ink-600">
        PADRES VINCULADOS
      </div>

      <div className="flex flex-col gap-[14px]">
        {parents.map((parent, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full font-display font-semibold text-white"
              style={{ backgroundColor: parent.avatarBg }}
            >
              {parent.avatarInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-extrabold text-ink-900">{parent.name}</div>
              <div className="text-[12.5px] text-ink-400">
                {parent.role} · {parent.status}
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-[9px] py-[4px] text-[10.5px] font-extrabold ${
                parent.status === "activa"
                  ? "bg-green-light text-green-deep"
                  : "bg-[#F7E7A6] text-[#9A7B1E]"
              }`}
            >
              {parent.status === "activa" ? "ACTIVA" : "PENDIENTE"}
            </span>
          </div>
        ))}

        <button className="flex items-center gap-3 border-none bg-none p-0 pt-2 cursor-pointer text-left">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-border-muted text-ink-300">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="text-[14.5px] font-extrabold text-coral-900">Vincular otro padre</span>
        </button>
      </div>
    </div>
  );
}
