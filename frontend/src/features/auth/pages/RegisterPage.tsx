import { useState } from "react";
import { useNavigate, NavLink } from "react-router";
import { Loader2, UserPlus, ArrowRight, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../api/registerApi";
import { cn } from "@/lib/utils";

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      navigate("/auth", { state: { registered: true } });
    },
    onError: (error: Error) => {
      setServerError(error.message || "Registration failed. Please try again.");
    },
  });

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    mutation.mutate({ email, password });
  }

  return (
    <div className="app-page grain relative flex items-center justify-center">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-[#64f38c]/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-[#f79d00]/4 blur-[100px]" />

      {/* Diagonal accent line */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-px rotate-12 bg-gradient-to-b from-transparent via-[#64f38c]/10 to-transparent" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="reveal">
          <div className="glass overflow-hidden rounded-3xl">
            {/* Header */}
            <div className="relative border-b border-white/[0.04] px-8 pt-10 pb-8 text-center">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-16 left-1/2 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-[#64f38c]/5 blur-[60px]" />
              </div>

              <div className="relative z-10">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#64f38c]/20 to-[#f79d00]/10">
                  <UserPlus className="h-6 w-6 text-[#64f38c]" />
                </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight">
                  Create account
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Register to start booking your car reservations.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 px-8 py-8">
              {serverError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {serverError}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={cn(
                    "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-[#64f38c]/30 focus:border-[#64f38c]/50",
                    errors.email
                      ? "border-red-500/50"
                      : "border-white/10 hover:border-white/20",
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 5 characters"
                  className={cn(
                    "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-[#64f38c]/30 focus:border-[#64f38c]/50",
                    errors.password
                      ? "border-red-500/50"
                      : "border-white/10 hover:border-white/20",
                  )}
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={cn(
                    "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-[#64f38c]/30 focus:border-[#64f38c]/50",
                    errors.confirmPassword
                      ? "border-red-500/50"
                      : "border-white/10 hover:border-white/20",
                  )}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#64f38c] to-[#f79d00] px-6 py-3.5 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#64f38c]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#64f38c]/30 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground/50">
                <NavLink
                  to="/auth"
                  className="flex items-center gap-1.5 text-muted-foreground/70 transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Sign In
                </NavLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
