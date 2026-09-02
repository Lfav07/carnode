import { NavLink } from "react-router";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Car Groups" },
  { to: "/stores", label: "Stores" },
  { to: "/auth", label: "Login" },
];

const supportLinks = [
  { to: "#", label: "Contact" },
  { to: "#", label: "FAQ" },
  { to: "#", label: "Terms & Conditions" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="accent-line" />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <NavLink to="/" className="font-heading text-2xl font-bold tracking-tight">
              <span className="text-gradient">Carnode</span>
            </NavLink>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Premium car rental at your fingertips. Choose your ride, pick your
              spot, and hit the road.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-widest text-foreground/60">
              Navigation
            </h4>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-widest text-foreground/60">
              Support
            </h4>
            <ul className="mt-5 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/5 pt-8 text-center text-xs text-muted-foreground/50">
          &copy; {new Date().getFullYear()} Carnode. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
