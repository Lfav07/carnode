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
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
        <NavLink to="/" className="mr-6 text-lg font-bold">
          Carnode
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
                        cn(navigationMenuTriggerStyle(), isActive && "bg-muted")
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
