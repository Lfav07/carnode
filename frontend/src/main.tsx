import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";

import { AppLayout } from "@/app/layout/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { CarsPage } from "@/features/cars/pages/CarsPage";
import { StoresPage } from "@/features/stores/pages/StoresPage";
import { ReservesPage } from "@/features/reserves/pages/ReservesPage";
import { AuthPage } from "@/features/auth/pages/AuthPage";

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
    <RouterProvider router={router} />
  </StrictMode>
);
