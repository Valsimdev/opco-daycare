import { MobileNav } from "@/app/_components/mobile-nav";
import { Sidebar } from "@/app/_components/sidebar";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function StaffLayout({ children }: LayoutProps<"/">) {
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

  if (error || !userRow || userRow.role !== "staff") {
    redirect("/auth/login");
  }

  const userInitial = userRow.full_name.charAt(0).toUpperCase();
  const userRole = userRow.role.charAt(0).toUpperCase() + userRow.role.slice(1);

  return (
    <div className="flex min-h-screen">
      <div className="max-lg:hidden">
        <Sidebar userName={userRow.full_name} userInitial={userInitial} userRole={userRole} />
      </div>
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <MobileNav userName={userRow.full_name} userInitial={userInitial} userRole={userRole} />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
