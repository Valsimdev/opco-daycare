import { useState } from "react";

interface AuthFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  name?: string;
  variant?: "default" | "focus";
  onChange?: (value: string) => void;
}

export function AuthField({
  label,
  type = "text",
  placeholder,
  value: controlledValue,
  name,
  variant = "default",
  onChange,
}: AuthFieldProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <div className="mb-[18px]">
      <div className="mb-2 text-xs font-extrabold tracking-wider text-ink-600 uppercase">
        {label}
      </div>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-[15px] text-ink-900 transition-colors placeholder:text-[#B6A99B] ${
          variant === "focus"
            ? "border-[#F2A78E]"
            : "border-border-soft"
        }`}
      />
    </div>
  );
}
