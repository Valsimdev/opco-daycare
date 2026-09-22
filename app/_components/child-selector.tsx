"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ChildSelectorProps {
  childList: { id: string; name: string; avatarBg: string; avatarTextColor: string }[];
}

export function ChildSelector({ childList }: ChildSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedChild = searchParams.get("child") ?? "all";

  const handleSelect = (childId: string) => {
    if (childId === "all") {
      router.replace("/family");
    } else {
      router.replace(`/family?child=${childId}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-[10px] mb-[22px]">
      {childList.map((child) => {
        const isActive = selectedChild === child.id;
        return (
          <button
            key={child.id}
            type="button"
            onClick={() => handleSelect(child.id)}
            className={`flex items-center gap-2 rounded-full px-2 py-1.5 text-[14px] font-bold cursor-pointer ${
              isActive
                ? "border-[1.5px] border-ink-900 bg-ink-900 text-white"
                : "border-[1.5px] border-border bg-surface text-ink-700"
            }`}
          >
            <span
              className="flex size-[26px] items-center justify-center rounded-full font-display font-semibold text-[13px]"
              style={{ backgroundColor: child.avatarBg, color: child.avatarTextColor }}
            >
              {child.name.charAt(0)}
            </span>
            {child.name}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => handleSelect("all")}
        className={`rounded-full px-4 py-1.5 text-[14px] font-bold cursor-pointer ${
          selectedChild === "all"
            ? "border-[1.5px] border-ink-900 bg-ink-900 text-white"
            : "border-[1.5px] border-border bg-surface text-ink-700"
        }`}
      >
        Todos
      </button>
    </div>
  );
}
