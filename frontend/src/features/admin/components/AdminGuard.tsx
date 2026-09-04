import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
      return;
    }

    if (!hasRole("admin")) {
      navigate("/", { replace: true });
    }
  }, [isLoading, isAuthenticated, hasRole, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-[#f79d00]" />
          <div className="absolute inset-0 animate-ping rounded-full bg-[#f79d00]/10" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !hasRole("admin")) {
    return null;
  }

  return <>{children}</>;
}
