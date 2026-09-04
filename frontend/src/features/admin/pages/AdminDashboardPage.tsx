import { Users, Car, MapPin, CalendarDays, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { useAdminUsers } from "@/features/users/hooks/usersAdminHooks";
import { useAdminCars } from "@/features/cars/hooks/carsAdminHooks";
import { useAdminStores } from "@/features/stores/hooks/storesAdminHooks";
import { useAdminReserves } from "@/features/reserves/hooks/reservesAdminHooks";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { getReserveStatusVariant } from "../utils/adminStatusUtils";

const statCards = [
  {
    key: "users",
    label: "Users",
    icon: Users,
    to: "/admin/users",
    color: "from-sky-500/20 to-blue-600/20",
    iconColor: "text-sky-400",
  },
  {
    key: "cars",
    label: "Cars",
    icon: Car,
    to: "/admin/cars",
    color: "from-emerald-500/20 to-teal-600/20",
    iconColor: "text-emerald-400",
  },
  {
    key: "stores",
    label: "Stores",
    icon: MapPin,
    to: "/admin/stores",
    color: "from-purple-500/20 to-fuchsia-600/20",
    iconColor: "text-purple-400",
  },
  {
    key: "reserves",
    label: "Reservations",
    icon: CalendarDays,
    to: "/admin/reserves",
    color: "from-amber-500/20 to-orange-600/20",
    iconColor: "text-amber-400",
  },
];

export function AdminDashboardPage() {
  const usersQuery = useAdminUsers({ page: 1, limit: 1 });
  const carsQuery = useAdminCars({ page: 1, limit: 1 });
  const storesQuery = useAdminStores();
  const reservesQuery = useAdminReserves({ page: 1, limit: 5 });

  const counts = {
    users: usersQuery.data?.meta?.totalCount ?? 0,
    cars: carsQuery.data?.meta?.totalCount ?? 0,
    stores: Array.isArray(storesQuery.data) ? storesQuery.data.length : 0,
    reserves: reservesQuery.data?.meta?.totalCount ?? 0,
  };

  const isLoading = usersQuery.isLoading || carsQuery.isLoading || storesQuery.isLoading;

  return (
    <div>
      <AdminPageHeader
        title="Admin Dashboard"
        subtitle="System overview"
      />

      {/* Stats Row */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.key}
            to={card.to}
            className="glass-light hover-glow rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                {isLoading ? (
                  <div className="mt-1 h-8 w-16 animate-pulse rounded bg-white/[0.06]" />
                ) : (
                  <p className="mt-1 font-heading text-2xl font-bold">
                    {counts[card.key as keyof typeof counts]}
                  </p>
                )}
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color}`}
              >
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="font-heading mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Link
              key={card.key}
              to={card.to}
              className="glass-light rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-white/[0.06] hover:text-foreground"
            >
              View {card.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Reservations */}
      <div>
        <h2 className="font-heading mb-4 text-lg font-semibold">Recent Reservations</h2>
        {reservesQuery.isLoading ? (
          <div className="glass-light rounded-2xl p-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#f79d00]" />
          </div>
        ) : reservesQuery.data?.data && reservesQuery.data.data.length > 0 ? (
          <div className="glass-light rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                    Car
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {reservesQuery.data.data.map((res) => (
                  <tr
                    key={res.id}
                    className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-sm text-foreground">
                      {res.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {res.userId.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {res.carId.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={getReserveStatusVariant(res.status)}
                        label={res.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f79d00]/10">
              <CalendarDays className="h-6 w-6 text-[#f79d00]" />
            </div>
            <h3 className="font-heading text-lg font-semibold">No reservations yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Reservations will appear here once they are created.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
