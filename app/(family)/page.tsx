import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { classroom, familyKids, familyPosts } from "@/app/_data/family-mock";
import { PostCard } from "@/app/_components/post-card";
import { ChildSelector } from "@/app/_components/child-selector";

export default async function FamilyFeedPage() {
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

  const childrenWithAvatar = dbChildren
    .map((dbChild) => {
      const mockMatch = familyKids.find(
        (mk) => mk.name === dbChild.full_name.split(" ")[0]
      );
      return mockMatch
        ? { ...mockMatch, id: dbChild.id }
        : {
            id: dbChild.id,
            name: dbChild.full_name.split(" ")[0],
            avatarBg: "#C9B6E8",
            avatarTextColor: "#7B5FC0",
          };
    });

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
          HOY · {classroom.dateLabel.toUpperCase()}
        </span>
        <span className="h-px flex-1 bg-border-strong" />
      </div>

      <div className="flex flex-col gap-4">
        {familyPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
