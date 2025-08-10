import { Outlet, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import CheckinExpressPage from "@/features/arrivals/CheckinExpressPage";
import RackGrid from "@/features/rack/RackGrid";
import NotFound from "@/pages/NotFound";
import { Link } from "react-router-dom";

function Layout() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 py-2 flex items-center gap-3">
          <Link to="/" className="text-sm font-semibold">AfricaSuite PMS</Link>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/arrivals" className="text-sm text-muted-foreground hover:underline">Arrivées</Link>
            <Link to="/reservations/rack" className="text-sm text-muted-foreground hover:underline">Rack</Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="arrivals" element={<CheckinExpressPage />} />
        <Route path="reservations/rack" element={<RackGrid />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
