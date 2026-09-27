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
    .select("role, full_name, daycare_id")
    .eq("id", user.id)
    .single();

  if (error || !userRow || userRow.role !== "staff") {
    redirect("/auth/login");
  }

  const userInitial = userRow.full_name.charAt(0).toUpperCase();
  const userRole = userRow.role.charAt(0).toUpperCase() + userRow.role.slice(1);

  // Obtener las salas (rooms) del daycare
  let roomId: string | null = null;
  let roomName = "Soles";
  let kidsCount = 0;
  let dateLabel = "";
  const roomChildren: Array<{ id: string; full_name: string }> = [];

  if (userRow.daycare_id) {
    const { data: rooms } = await supabase
      .from("rooms")
      .select("id, name")
      .eq("daycare_id", userRow.daycare_id)
      .order("name");

    if (rooms && rooms.length > 0) {
      // Use the first room as default for roomId/roomName
      roomId = rooms[0].id;
      roomName = rooms[0].name;

      // Get children from all rooms
      const roomIds = rooms.map((r) => r.id);
      const { data: kids } = await supabase
        .from("children")
        .select("id, full_name")
        .in("room_id", roomIds)
        .eq("status", "active")
        .order("full_name");

      roomChildren.push(...(kids ?? []));
      kidsCount = kids?.length ?? 0;
    }
  }

  const now = new Date();
  const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  dateLabel = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;

  return (
    <div className="flex min-h-screen">
      <div className="max-lg:hidden">
        <Sidebar
          userName={userRow.full_name}
          userInitial={userInitial}
          userRole={userRole}
          roomName={roomName}
          childrenCount={kidsCount}
          dateLabel={dateLabel}
          roomId={roomId}
          kids={roomChildren}
        />
      </div>
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <MobileNav
          userName={userRow.full_name}
          userInitial={userInitial}
          userRole={userRole}
          roomName={roomName}
          childrenCount={kidsCount}
          dateLabel={dateLabel}
          roomId={roomId}
          kids={roomChildren}
        />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
