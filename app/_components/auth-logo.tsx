export function AuthLogo() {
  return (
    <div className="flex items-center gap-[13px]">
      <div className="flex size-[46px] shrink-0 items-center justify-center rounded-[14px] bg-white/20">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </div>
      <span className="font-display text-[21px] font-semibold tracking-[0.5px] text-white">
        OpenDayCare
      </span>
    </div>
  );
}
