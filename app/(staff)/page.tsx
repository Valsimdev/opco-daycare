import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { PostCard, PostCardData } from "@/app/_components/post-card";
import { getFeedPosts } from "@/app/_actions/feed-actions";
import { getCurrentUserRoom } from "@/app/_actions/room-actions";

function formatDateGroup(publishedAt: string): string {
  const postDate = new Date(publishedAt);
  const now = new Date();

  const postDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;

  if (postDay === today) return "PUBLICADO HOY";
  if (postDay === yesterday) return "AYER";

  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${postDate.getDate()} ${months[postDate.getMonth()]} ${postDate.getFullYear()}`;
}

function formatTime(publishedAt: string): string {
  const d = new Date(publishedAt);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default async function FeedPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("daycare_id, full_name")
    .eq("id", user.id)
    .single();

  const roomId = userRow?.daycare_id ? await getCurrentUserRoom(user.id) : null;

  const posts = await getFeedPosts(roomId);

  const grouped: Record<string, typeof posts> = {};
  for (const post of posts) {
    const group = formatDateGroup(post.published_at);
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(post);
  }

  const now = new Date();
  const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const dateLabel = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;

  let roomName = "Soles";
  let childrenCount = 0;

  if (userRow?.daycare_id) {
    const { data: room } = await supabase
      .from("rooms")
      .select("name")
      .eq("daycare_id", userRow.daycare_id)
      .single();

    if (room) {
      roomName = room.name;
      const { data: kids } = await supabase
        .from("children")
        .select("id")
        .eq("room_id", (await getCurrentUserRoom(user.id)) ?? "")
        .eq("status", "active");

      childrenCount = kids?.length ?? 0;
    }
  }

  const firstName = userRow?.full_name?.split(" ")[0] ?? "Staff";

  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
      <div className="mb-6">
        <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-coral-800">
          GUARDERÍA · SALA {roomName.toUpperCase()}
        </div>
        <h1 className="m-0 font-display text-[30px] font-semibold text-ink-900">Buenas, {firstName}</h1>
        <p className="m-0 mt-[5px] text-[14.5px] text-ink-500">
          {childrenCount} niños · {dateLabel}
        </p>
      </div>

      <div className="mb-6 flex cursor-default items-center gap-[14px] rounded-[18px] border border-border bg-surface px-[18px] py-3.5 shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]">
        <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(155deg,var(--color-coral-300),var(--color-coral-400))]">
          <span className="font-display text-[15px] font-semibold text-white">{firstName.charAt(0).toUpperCase()}</span>
        </div>
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
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-400">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 opacity-50"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <p className="text-[16px] font-medium">Compartí un momento…</p>
        </div>
      ) : (
        Object.entries(grouped).map(([group, groupPosts]) => (
          <div key={group} className="mb-8">
            <div className="mb-3.5 flex items-center gap-[14px]">
              <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-ink-600">{group}</span>
              <span className="h-px flex-1 bg-border-strong" />
            </div>

            <div className="flex flex-col gap-4">
              {groupPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    author_name: post.author_name,
                    type: post.type,
                    title: post.title ?? "",
                    body: post.body,
                    published_at: post.published_at,
                    time: formatTime(post.published_at),
                    children: post.children,
                    photos: post.photos,
                  } as PostCardData}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
