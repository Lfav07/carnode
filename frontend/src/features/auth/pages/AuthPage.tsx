import { useNavigate, NavLink } from "react-router";
import { Loader2, LogIn, LogOut, User, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "../AuthProvider";
import { cn } from "@/lib/utils";

export function AuthPage() {
  const { isAuthenticated, isLoading, login, logout, token } = useAuth();
  const navigate = useNavigate();

  function parseJwt(t: string) {
    try {
      return JSON.parse(atob(t.split(".")[1]));
    } catch {
      return null;
    }
  }

  const payload = token ? parseJwt(token) : null;
  const email: string | undefined = payload?.email;
  const name: string | undefined = payload?.name ?? payload?.preferred_username;

  if (isLoading) {
    return (
      <div className="app-page grain relative flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-[#f79d00]" />
            <div className="absolute inset-0 animate-ping rounded-full bg-[#f79d00]/10" />
          </div>
          <p className="mt-6 font-heading text-sm font-medium text-muted-foreground">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page grain relative flex items-center justify-center">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-[#f79d00]/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-[#64f38c]/4 blur-[100px]" />

      {/* Diagonal accent line */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-px rotate-12 bg-gradient-to-b from-transparent via-[#f79d00]/10 to-transparent" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Not authenticated */}
        {!isAuthenticated && (
          <div className="reveal">
            <div className="glass overflow-hidden rounded-3xl">
              {/* Header */}
              <div className="relative border-b border-white/[0.04] px-8 pt-10 pb-8 text-center">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -top-16 left-1/2 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-[#f79d00]/5 blur-[60px]" />
                </div>

                <div className="relative z-10">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f79d00]/20 to-[#64f38c]/10">
                    <Shield className="h-6 w-6 text-[#f79d00]" />
                  </div>
                  <h1 className="font-heading text-2xl font-bold tracking-tight">
                    Welcome back
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sign in to access your reservations and manage your account.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 px-8 py-8">
                <button
                  onClick={login}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3.5 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
  
                </button>

                <p className="text-center text-xs text-muted-foreground/50">
                  Don&apos;t have an account?{" "}
                  <NavLink
                    to="/register"
                    className="text-[#64f38c]/70 transition-colors hover:text-[#64f38c]"
                  >
                    Register
                  </NavLink>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Authenticated */}
        {isAuthenticated && (
          <div className="reveal">
            <div className="glass overflow-hidden rounded-3xl">
              {/* Header */}
              <div className="relative border-b border-white/[0.04] px-8 pt-10 pb-8 text-center">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -top-16 left-1/2 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-[#64f38c]/5 blur-[60px]" />
                </div>

                <div className="relative z-10">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#64f38c]/20 to-[#f79d00]/10">
                    <User className="h-6 w-6 text-[#64f38c]" />
                  </div>
                  <h1 className="font-heading text-2xl font-bold tracking-tight">
                    You&apos;re signed in
                  </h1>
                  {name && (
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {name}
                    </p>
                  )}
                  {email && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {email}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 px-8 py-8">
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className={cn(
                    "flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 font-heading text-sm font-semibold transition-all duration-300",
                    "hover:border-white/20 hover:bg-white/[0.06]",
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>

                <button
                  onClick={() => navigate("/reserves")}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3.5 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110"
                >
                  View My Reservations
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
