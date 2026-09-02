import { Link } from "react-router";

export function HomePage() {
  return (
    <div className="app-page flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Carnode</h1>
      <p className="text-muted-foreground">Car rental made simple</p>
      <div className="flex gap-4">
        <Link
          to="/cars"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse Cars
        </Link>
        <Link
          to="/stores"
          className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Find a Store
        </Link>
      </div>
    </div>
  );
}
