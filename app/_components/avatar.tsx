import type { ReactNode } from "react";

type AvatarVariant = "coral" | "sky" | "indigo";
type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  initial?: string;
  icon?: ReactNode;
  variant?: AvatarVariant;
  size?: AvatarSize;
}

const variantClasses: Record<AvatarVariant, string> = {
  coral: "bg-coral-400 text-white",
  sky: "bg-sky-light text-sky-deep",
  indigo: "bg-indigo-light text-indigo-deep",
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-9.5 text-base",
  md: "size-10 text-base",
  lg: "size-11 text-[17px]",
};

export function Avatar({ initial, icon, variant = "coral", size = "md" }: AvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-semibold ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {icon ?? initial}
    </div>
  );
}
