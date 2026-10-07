import { Link } from "react-router";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Wordmark } from "./SiteHeader";

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark light />
            <p className="mt-6 max-w-sm font-serif text-2xl leading-snug text-white/85">
              Every car, honestly described. Every deal, personally handled.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="gold-rule" />
              <span className="spec-label !text-gold">400+ cars placed since 2016</span>
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="spec-label !text-white/50">Explore</p>
            <ul className="mt-5 space-y-3">
              {[
                { to: "/cars", label: "Cars in stock" },
                { to: "/sourced", label: "Sourced on request" },
                { to: "/track", label: "Track your inquiry" },
                { to: "/admin", label: "Staff login" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="link-underline text-sm text-white/75 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="spec-label !text-white/50">Visit or call</p>
            <ul className="mt-5 space-y-4 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                Mombasa Road, next to Sameer Business Park, Nairobi
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href="tel:+254700000000" className="hover:text-white">
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href="mailto:deals@motari.co.ke" className="hover:text-white">
                  deals@motari.co.ke
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                Mon–Sat · 8:00–18:00 EAT
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            © {new Date().getFullYear()} Motari Motors Ltd · Nairobi, Kenya
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Your details stay private unless you choose to share them
          </p>
        </div>
      </div>
    </footer>
  );
}
