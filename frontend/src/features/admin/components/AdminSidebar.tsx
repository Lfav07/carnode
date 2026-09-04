import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Car,
  MapPin,
  CalendarDays,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/cars", label: "Cars", icon: Car },
  { to: "/admin/stores", label: "Stores", icon: MapPin },
  { to: "/admin/reserves", label: "Reservations", icon: CalendarDays },
];

export function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-white/5 bg-[#0c0c14]/90 backdrop-blur-xl">
      {/* Logo section */}
      <div className="border-b border-white/5 px-6 py-5">
        <NavLink
          to="/admin"
          className="font-heading text-lg font-bold tracking-tight"
        >
          <span className="text-gradient">Carnode</span>
          <span className="ml-2 text-xs font-medium text-muted-foreground/50">
            Admin
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/[0.06] text-[#f79d00]"
                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/5 px-3 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-white/[0.03] hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          Back to Site
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-white/[0.03] hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
