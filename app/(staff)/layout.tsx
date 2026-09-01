import { MobileNav } from "@/app/_components/mobile-nav";
import { Sidebar } from "@/app/_components/sidebar";

export default function StaffLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen">
      <div className="max-lg:hidden">
        <Sidebar />
      </div>
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
