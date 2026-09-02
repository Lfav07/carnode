import { Outlet } from "react-router";
import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
