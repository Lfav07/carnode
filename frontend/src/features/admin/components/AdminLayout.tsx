import { Outlet } from "react-router";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="app-page grain relative">
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-[#f79d00]/4 blur-[120px]" />
          <div className="pointer-events-none absolute right-1/3 bottom-40 h-[300px] w-[300px] rounded-full bg-[#64f38c]/3 blur-[100px]" />

          {/* Diagonal accent line */}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-px rotate-12 bg-gradient-to-b from-transparent via-[#f79d00]/8 to-transparent" />

          <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-24">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
