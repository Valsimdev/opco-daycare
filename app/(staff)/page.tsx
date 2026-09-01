import { classroom, posts, profile } from "@/app/_data/mock";
import { Avatar } from "@/app/_components/avatar";
import { PostCard } from "@/app/_components/post-card";

export default function FeedPage() {
  const firstName = profile.name.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
      <div className="mb-6">
        <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-coral-800">
          GUARDERÍA · SALA {classroom.name.toUpperCase()}
        </div>
        <h1 className="m-0 font-display text-[30px] font-semibold text-ink-900">Buenas, {firstName}</h1>
        <p className="m-0 mt-[5px] text-[14.5px] text-ink-500">
          {classroom.children} niños · {classroom.dateLabel}
        </p>
      </div>

      <a className="mb-6 flex cursor-pointer items-center gap-[14px] rounded-[18px] border border-border bg-surface px-[18px] py-3.5 shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]">
        <Avatar initial={profile.initial} variant="coral" size="md" />
        <span className="flex-1 text-[15px] text-ink-400">Compartí un momento…</span>
        <span className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-peach text-coral-700">
          <svg
            aria-hidden="true"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </span>
      </a>

      <div className="mb-3.5 flex items-center gap-[14px]">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-ink-600">PUBLICADO HOY</span>
        <span className="h-px flex-1 bg-border-strong" />
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
