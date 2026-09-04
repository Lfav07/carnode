import { NavLink } from "react-router";
import { LogOut, User } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/utils";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Cars" },
  { to: "/stores", label: "Stores" },
];

const authLinks = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Cars" },
  { to: "/stores", label: "Stores" },
  { to: "/reserves", label: "Reservations" },
];

export function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const links = isAuthenticated ? authLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0c0c14]/80 backdrop-blur-xl">
      <div className="accent-line absolute right-0 bottom-0 left-0" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <NavLink
          to="/"
          className="mr-6 font-heading text-lg font-bold tracking-tight"
        >
          <span className="text-gradient">Carnode</span>
        </NavLink>

        <div className="flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              {links.map((link) => (
                <NavigationMenuItem key={link.to}>
                  <NavigationMenuLink
                    render={
                      <NavLink
                        to={link.to}
                        className={({ isActive }) =>
                          cn(
                            navigationMenuTriggerStyle(),
                            isActive && "bg-white/[0.06] text-foreground",
                            "text-muted-foreground hover:text-foreground",
                          )
                        }
                      />
                    }
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth section */}
          {!isLoading && (
            <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-4">
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/auth"
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                  </NavLink>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <NavLink
                  to="/auth"
                  className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/[0.08] hover:text-foreground"
                >
                  Sign In
                </NavLink>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
