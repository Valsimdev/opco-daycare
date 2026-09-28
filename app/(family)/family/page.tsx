import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PostCard, PostCardData } from "@/app/_components/post-card";
import { ChildSelector } from "@/app/_components/child-selector";
import { getFamilyFeedPosts } from "@/app/_actions/feed-actions";

interface FamilyChild {
  id: string;
  name: string;
  avatarBg: string;
  avatarTextColor: string;
}

const AVATAR_COLORS = [
  { bg: "#A9D9E8", text: "#1F7A93" },
  { bg: "#F4B8CC", text: "#C44A7A" },
  { bg: "#C9B6E8", text: "#7B5FC0" },
  { bg: "#B8E8C9", text: "#3D8B6E" },
  { bg: "#F4D9B8", text: "#C49A3D" },
];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function formatTime(publishedAt: string): string {
  const d = new Date(publishedAt);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatDateLabel(): string {
  const now = new Date();
  const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
}

export default async function FamilyFeedPage(props: { searchParams: Promise<{ child?: string }> }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single();

  if (!userRow) {
    redirect("/auth/login");
  }

  const { data: childrenRows } = await supabase
    .from("parent_children")
    .select("child:children(id, full_name)")
    .eq("parent_id", user.id);

  const dbChildren =
    childrenRows?.map((pc) => {
      const child = pc.child as unknown as { id: string; full_name: string } | null;
      return child;
    }).filter((c): c is { id: string; full_name: string } => !!c) ?? [];

  const firstName = userRow.full_name.split(" ")[0];

  const childrenWithAvatar: FamilyChild[] = dbChildren.map((dbChild, idx) => {
    const colors = getAvatarColor(idx);
    return {
      id: dbChild.id,
      name: dbChild.full_name.split(" ")[0],
      avatarBg: colors.bg,
      avatarTextColor: colors.text,
    };
  });

  const searchParams = await props.searchParams;
  const selectedChildId = searchParams.child === "all" ? null : (searchParams.child ?? null);

  const posts = await getFamilyFeedPosts(user.id, selectedChildId);

  const postCards: PostCardData[] = posts.map((post) => ({
    id: post.id,
    author_name: post.author_name,
    type: post.type,
    title: post.child_name ?? (post.type === "announcement" ? "Anuncio general" : post.title ?? ""),
    body: post.body,
    published_at: post.published_at,
    time: formatTime(post.published_at),
    children: post.child_name ? [{ id: post.id, full_name: post.child_name }] : [],
    photos: post.photos,
    roomName: post.room_name ?? undefined,
  }));

  const dateLabel = formatDateLabel();

  return (
    <div className="mx-auto w-full max-w-[720px] px-10 pb-20 pt-[34px]">
      <div className="mb-5">
        <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-coral-800">
          TU FAMILIA
        </div>
        <h1 className="m-0 font-display text-[30px] font-semibold text-ink-900">
          Hola, {firstName}
        </h1>
        <p className="m-0 mt-[5px] text-[14.5px] text-ink-500">
          Así va el día de hoy
        </p>
      </div>

      <ChildSelector childList={childrenWithAvatar} />

      <div className="mb-3.5 flex items-center gap-[14px]">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-ink-600">
          HOY · {dateLabel.toUpperCase()}
        </span>
        <span className="h-px flex-1 bg-border-strong" />
      </div>

      {postCards.length === 0 ? (
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
          <p className="text-[16px] font-medium">Aún no hay publicaciones para hoy</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {postCards.map((post) => (
            <PostCard key={post.id} post={post} roomName={post.roomName} />
          ))}
        </div>
      )}
    </div>
  );
}
