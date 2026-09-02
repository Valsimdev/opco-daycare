interface AuthButtonProps {
  children: React.ReactNode;
  href?: string;
}

export function AuthButton({ children, href }: AuthButtonProps) {
  const base =
    "block w-full rounded-[15px] bg-gradient-to-b from-coral-500 to-coral-600 py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] cursor-pointer";

  if (href) {
    return (
      <a href={href} className={base}>
        {children}
      </a>
    );
  }

  return <button type="button" className={base}>{children}</button>;
}
