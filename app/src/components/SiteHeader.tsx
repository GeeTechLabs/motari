import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Menu, Phone, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Cars in stock" },
  { to: "/sourced", label: "Sourced on request" },
  { to: "/track", label: "Track inquiry" },
];

export function Wordmark({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-baseline gap-2 group">
      <span
        className={cn(
          "font-serif text-[22px] leading-none tracking-tight",
          light ? "text-white" : "text-ink",
        )}
      >
        Motari<span className="text-gold">.</span>
      </span>
      <span
        className={cn(
          "font-mono text-[9px] uppercase tracking-[0.22em]",
          light ? "text-white/60" : "text-ink-mute",
        )}
      >
        Motors · Nairobi
      </span>
    </Link>
  );
}

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-ink/95 backdrop-blur-md transition-shadow duration-500",
        scrolled && "shadow-[0_1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.25)]",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[72px] md:px-8">
        <Wordmark light />

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "link-underline font-mono text-[11px] uppercase tracking-[0.18em] text-white/80 hover:text-white",
                  isActive && "active text-gold",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href="tel:+254700000000"
            className="flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/85 hover:text-gold"
          >
            <Phone className="h-3.5 w-3.5" />
            +254 700 000 000
          </a>
          <button
            onClick={() => navigate("/cars")}
            className="btn-gold !min-h-[40px] px-5"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            View stock
          </button>
        </div>

        {/* mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm border-l-0 bg-ink p-0 text-white">
            <div className="flex h-full flex-col px-7 pb-8 pt-20 safe-bottom">
              <nav className="flex flex-col gap-1">
                {NAV.map((n, i) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "border-b border-white/10 py-5 font-serif text-2xl",
                        isActive ? "text-gold" : "text-white",
                      )
                    }
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {n.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto space-y-4">
                <p className="spec-label !text-white/50">Talk to the broker</p>
                <a href="tel:+254700000000" className="font-serif text-xl text-gold">
                  +254 700 000 000
                </a>
                <p className="text-sm text-white/60">
                  Mon–Sat · 8:00–18:00 · Mombasa Road, Nairobi
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
