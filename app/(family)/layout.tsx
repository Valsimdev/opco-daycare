import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FamilySidebar } from "@/app/_components/family-sidebar";
import { FamilyMobileNav } from "@/app/_components/family-mobile-nav";

export default async function FamilyLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userRow, error } = await supabase
    .from("users")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (error || !userRow || userRow.role !== "parent") {
    redirect("/");
  }

  const { data: childrenRows } = await supabase
    .from("parent_children")
    .select("relationship, child:children(full_name)")
    .eq("parent_id", user.id);

  const childrenNames: string[] =
    childrenRows
      ?.map((pc) => {
        const child = pc.child as unknown as { full_name: string } | null;
        return child?.full_name;
      })
      .filter((name): name is string => !!name) ?? [];

  const relationship = childrenRows?.[0]?.relationship ?? null;
  const userInitial = userRow.full_name.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen">
      <div className="max-lg:hidden">
        <FamilySidebar
          userName={userRow.full_name}
          userInitial={userInitial}
          relationship={relationship}
          childrenNames={childrenNames}
        />
      </div>
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <FamilyMobileNav
          userName={userRow.full_name}
          userInitial={userInitial}
          relationship={relationship}
          childrenNames={childrenNames}
        />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
