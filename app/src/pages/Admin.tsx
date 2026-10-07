import { Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router";
import {
  CarFront,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PackageSearch,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/const";
import { trpc } from "@/providers/trpc";
import { cn } from "@/lib/utils";
import AdminDashboard from "./AdminDashboard";
import AdminInquiries from "./AdminInquiries";
import AdminCars from "./AdminCars";
import AdminRequests from "./AdminRequests";

const SECTIONS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/inquiries", label: "Inquiries", icon: ClipboardList },
  { to: "/admin/cars", label: "Cars in stock", icon: CarFront },
  { to: "/admin/sourcing", label: "On request", icon: PackageSearch },
];

export default function Admin() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/60">
          Checking credentials…
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to={LOGIN_PATH} replace />;

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-6 text-center text-white">
        <h1 className="font-serif text-3xl">Staff area</h1>
        <p className="max-w-sm text-white/60">
          You’re signed in as {user.name ?? "a guest"}, but this account doesn’t have
          staff access.
        </p>
        <button
          onClick={() => logout()}
          className="btn-frame-light mt-2"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-white">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="font-serif text-lg leading-none"
            >
              Motari<span className="text-gold">.</span>
            </button>
            <span className="spec-chip !border-white/20 !text-white/60">Back office</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] text-white/60 sm:block">
              {user.name ?? user.email}
            </span>
            <button
              onClick={async () => {
                logout();
                await utils.invalidate();
              }}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-white/70 hover:text-gold"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* section nav — scrollable on mobile */}
        <nav className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 md:px-6">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              end={s.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[48px] shrink-0 items-center gap-2 border-b-2 px-4 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                  isActive
                    ? "border-gold text-gold"
                    : "border-transparent text-white/60 hover:text-white",
                )
              }
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="cars" element={<AdminCars />} />
          <Route path="sourcing" element={<AdminRequests />} />
          <Route
            path="*"
            element={
              <p className="py-20 text-center text-ink-mute">
                Unknown section —{" "}
                <Link to="/admin" className="text-gold-deep underline">
                  back to dashboard
                </Link>
              </p>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
