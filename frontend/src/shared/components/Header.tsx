import { NavLink } from "react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Cars" },
  { to: "/stores", label: "Stores" },
  { to: "/reserves", label: "Reservations" },
  { to: "/auth", label: "Login" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0c0c14]/80 backdrop-blur-xl">
      <div className="accent-line absolute right-0 bottom-0 left-0" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <NavLink to="/" className="mr-6 font-heading text-lg font-bold tracking-tight">
          <span className="text-gradient">Carnode</span>
        </NavLink>
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
      </div>
    </header>
  );
}
