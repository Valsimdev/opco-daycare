interface AuthFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  variant?: "default" | "focus";
}

export function AuthField({
  label,
  type = "text",
  placeholder,
  value,
  variant = "default",
}: AuthFieldProps) {
  return (
    <div className="mb-[18px]">
      <div className="mb-2 text-xs font-extrabold tracking-wider text-ink-600 uppercase">
        {label}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={value}
        className={`w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-[15px] text-ink-900 transition-colors placeholder:text-[#B6A99B] ${
          variant === "focus"
            ? "border-[#F2A78E]"
            : "border-border-soft"
        }`}
      />
    </div>
  );
}
