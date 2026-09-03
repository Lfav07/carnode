import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

import { AppLayout } from "@/app/layout/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { CarsPage } from "@/features/cars/pages/CarsPage";
import { StoresPage } from "@/features/stores/pages/StoresPage";
import { ReservesPage } from "@/features/reserves/pages/ReservesPage";
import { AuthPage } from "@/features/auth/pages/AuthPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/cars", element: <CarsPage /> },
      { path: "/stores", element: <StoresPage /> },
      { path: "/reserves", element: <ReservesPage /> },
      { path: "/auth", element: <AuthPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
