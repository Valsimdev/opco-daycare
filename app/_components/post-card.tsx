import type { Post } from "@/app/_data/mock";
import { Avatar } from "./avatar";
import { TagBadge } from "./tag-badge";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-[20px] border border-border bg-surface px-[22px] py-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <header className="mb-3.5 flex items-center gap-3">
        {post.type === "announcement" ? (
          <Avatar
            variant="indigo"
            icon={
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
              </svg>
            }
          />
        ) : (
          <Avatar variant="sky" initial={post.title.charAt(0)} />
        )}
        <div className="flex-1">
          <div className="font-display text-[16.5px] font-semibold text-ink-900">{post.title}</div>
          <div className="text-[12.5px] text-ink-400">
            {post.time} · {post.publishedBy}
          </div>
        </div>
        <TagBadge type={post.type} />
      </header>

      <p className="mb-2.5 text-[12.5px] text-ink-400">Para: {post.recipients}</p>
      <p className="m-0 text-[15.5px] leading-[1.55] text-ink-800">{post.text}</p>

      {post.photoPlaceholder ? (
        <a className="mt-3.5 flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-border-muted bg-surface-muted text-ink-300">
          <svg
            aria-hidden="true"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
          </svg>
          <span className="text-[13.5px]">{post.photoPlaceholder}</span>
        </a>
      ) : null}

      <footer className="mt-4 flex items-center gap-[18px] border-t border-border-soft pt-3.5">
        <span className="flex items-center gap-[7px] text-sm font-bold text-coral-700">
          <svg
            aria-hidden="true"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          {post.reactions}
        </span>
        <a className="flex cursor-pointer items-center gap-[7px] text-sm font-bold text-ink-500">
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
          </svg>
          {post.comments}
        </a>
        <a className="ms-auto cursor-pointer text-sm font-extrabold text-coral-900">Editar</a>
      </footer>
    </article>
  );
}
