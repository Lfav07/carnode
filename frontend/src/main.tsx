import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

import { AppLayout } from "@/app/layout/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { CarsPage } from "@/features/cars/pages/CarsPage";
import { AvailableCarsPage } from "@/features/cars/pages/AvailableCarsPage";
import { StoresPage } from "@/features/stores/pages/StoresPage";
import { ReservesPage } from "@/features/reserves/pages/ReservesPage";
import { AuthPage } from "@/features/auth/pages/AuthPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { AuthProvider } from "./features/auth/AuthProvider";

// Admin imports
import { AdminGuard } from "@/features/admin/components/AdminGuard";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { AdminUsersListPage } from "@/features/admin/pages/admin-users/AdminUsersListPage";
import { AdminUserDetailPage } from "@/features/admin/pages/admin-users/AdminUserDetailPage";
import { AdminCarsListPage } from "@/features/admin/pages/admin-cars/AdminCarsListPage";
import { AdminCarDetailPage } from "@/features/admin/pages/admin-cars/AdminCarDetailPage";
import { AdminCarFormPage } from "@/features/admin/pages/admin-cars/AdminCarFormPage";
import { AdminStoresListPage } from "@/features/admin/pages/admin-stores/AdminStoresListPage";
import { AdminStoreDetailPage } from "@/features/admin/pages/admin-stores/AdminStoreDetailPage";
import { AdminStoreFormPage } from "@/features/admin/pages/admin-stores/AdminStoreFormPage";
import { AdminReservesListPage } from "@/features/admin/pages/admin-reserves/AdminReservesListPage";
import { AdminReserveDetailPage } from "@/features/admin/pages/admin-reserves/AdminReserveDetailPage";
import { AdminReserveFormPage } from "@/features/admin/pages/admin-reserves/AdminReserveFormPage";

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
      { path: "/available-cars", element: <AvailableCarsPage /> },
      { path: "/stores", element: <StoresPage /> },
      { path: "/reserves", element: <ReservesPage /> },
      { path: "/auth", element: <AuthPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "users", element: <AdminUsersListPage /> },
      { path: "users/:userId", element: <AdminUserDetailPage /> },
      { path: "cars", element: <AdminCarsListPage /> },
      { path: "cars/new", element: <AdminCarFormPage /> },
      { path: "cars/:carId", element: <AdminCarDetailPage /> },
      { path: "cars/:carId/edit", element: <AdminCarFormPage /> },
      { path: "stores", element: <AdminStoresListPage /> },
      { path: "stores/new", element: <AdminStoreFormPage /> },
      { path: "stores/:storeId", element: <AdminStoreDetailPage /> },
      { path: "stores/:storeId/edit", element: <AdminStoreFormPage /> },
      { path: "reserves", element: <AdminReservesListPage /> },
      { path: "reserves/new", element: <AdminReserveFormPage /> },
      { path: "reserves/:reserveId", element: <AdminReserveDetailPage /> },
      { path: "reserves/:reserveId/edit", element: <AdminReserveFormPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
);
