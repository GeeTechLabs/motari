import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Eye,
  Handshake,
  KeyRound,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CarCard from "@/components/CarCard";
import RequestCarCard from "@/components/RequestCarCard";
import { Reveal } from "@/components/Reveal";
import InquiryDialog from "@/components/InquiryDialog";

/* ── count-up on scroll into view ────────────────────────────────────────── */
function useCountUp(target: number, durationMs = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / durationMs);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, durationMs]);
  return { ref, value };
}

function Stat({ target, suffix, label }: { target: number; suffix?: string; label: string }) {
  const { ref, value } = useCountUp(target);
  return (
    <div>
      <p className="font-serif text-4xl text-gold md:text-5xl">
        <span ref={ref}>{value.toLocaleString()}</span>
        {suffix}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
        {label}
      </p>
    </div>
  );
}

const TESTIMONIALS = [
  {
    quote:
      "I sent an inquiry at lunch and had photos, the auction sheet and a viewing booked by evening. The Prado was exactly as described — not a shilling in surprises.",
    name: "Wanjiru K.",
    detail: "Bought a 2019 Prado · Karen",
  },
  {
    quote:
      "What sold me was the privacy. I asked about three cars without giving my number to anyone. When I was ready, I shared it — and the deal closed in a week.",
    name: "Otieno M.",
    detail: "Bought a CX-5 · Westlands",
  },
  {
    quote:
      "They sourced my Harrier from Japan, handled duty, registration, everything. The inspection report matched the car bolt for bolt.",
    name: "Achieng N.",
    detail: "Sourced a 2021 Harrier · Kilimani",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Browse real stock",
    body: "Every car listed is physically available or verified in transit. Prices are final — no 'call for price' games on stock cars.",
    icon: Eye,
  },
  {
    n: "02",
    title: "Inquire — privately",
    body: "Ask anything without handing over your details. You get a reference code; the broker's reply waits for you on the tracking page.",
    icon: ShieldCheck,
  },
  {
    n: "03",
    title: "We handle the rest",
    body: "Inspection, logbook transfer, financing guidance, number plates. You drive out; we do the paperwork.",
    icon: KeyRound,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const featured = trpc.cars.featured.useQuery();
  const sourced = trpc.requestCars.search.useQuery({});

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-ink">
        <img
          src="/cars/hero.jpg"
          alt="A premium SUV on a Kenyan road at golden hour"
          className="ken-burns absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-32 md:px-8 md:pb-24">
          <p className="rise-in spec-label !text-gold" style={{ animationDelay: "100ms" }}>
            Trusted car broker · Nairobi, Kenya
          </p>
          <h1
            className="rise-in mt-5 max-w-3xl text-balance font-serif text-5xl leading-[1.04] text-white md:text-7xl"
            style={{ animationDelay: "220ms" }}
          >
            The right car.
            <br />
            The <span className="text-gold">honest</span> price.
          </h1>
          <p
            className="rise-in mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg"
            style={{ animationDelay: "340ms" }}
          >
            Over 400 cars matched to their owners since 2016. Every vehicle inspected,
            every deal handled personally — and your details stay yours until you say
            otherwise.
          </p>

          {/* search */}
          <form
            className="rise-in mt-9 flex max-w-xl"
            style={{ animationDelay: "460ms" }}
            onSubmit={(e) => {
              e.preventDefault();
              navigate(q.trim() ? `/cars?q=${encodeURIComponent(q.trim())}` : "/cars");
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try “Prado”, “CX-5”, “V8”…"
                className="h-14 w-full border-0 bg-sand pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-mute/70 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <button type="submit" className="btn-gold h-14 !min-h-0 px-7">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── stats band ───────────────────────────────────────────────────── */}
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 border-t border-white/10 px-5 py-14 md:grid-cols-4 md:px-8">
          <Stat target={400} suffix="+" label="Cars sold since 2016" />
          <Stat target={97} suffix="%" label="Clients who refer a friend" />
          <Stat target={24} suffix="h" label="Average first response" />
          <Stat target={100} suffix="%" label="Logbooks verified" />
        </div>
      </section>

      {/* ── featured stock ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="gold-rule" />
              <span className="spec-label">In the yard right now</span>
            </div>
            <h2 className="mt-4 font-serif text-4xl text-ink md:text-5xl">
              Featured stock
            </h2>
          </div>
          <Link to="/cars" className="btn-frame">
            All cars in stock
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse bg-sand-deep" />
            ))}
          {featured.data?.map((car, i) => (
            <Reveal key={car.id} delay={i * 90}>
              <CarCard car={car} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── sourced on request ───────────────────────────────────────────── */}
      <section className="bg-sand-deep/60">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="gold-rule" />
              <span className="spec-label">Can’t see your car?</span>
            </div>
            <h2 className="mt-4 font-serif text-4xl text-ink md:text-5xl">
              We source it for you.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-mute">
              Japan and UK imports on order — duty, shipping, inspection and
              registration handled end to end. No price shown online; ask, and the
              broker comes back to you with a landed figure.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sourced.data?.slice(0, 3).map((rc, i) => (
              <Reveal key={rc.id} delay={i * 90}>
                <RequestCarCard car={rc} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 flex flex-wrap gap-4">
            <Link to="/sourced" className="btn-frame">
              All cars we source
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <InquiryDialog
              type="sourcing"
              carName="a specific car"
              trigger={
                <button className="btn-frame !border-gold !text-gold-deep hover:!bg-gold hover:!text-ink">
                  Request something else
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              }
            />
          </Reveal>
        </div>
      </section>

      {/* ── how it works ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="gold-rule" />
            <span className="spec-label">How dealing with us works</span>
          </div>
          <h2 className="mt-4 max-w-xl font-serif text-4xl text-ink md:text-5xl">
            Three steps. No pressure, no spam.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100} className="bg-background">
              <div className="h-full p-8 md:p-10">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-5xl text-gold">{s.n}</span>
                  <s.icon className="h-6 w-6 text-ink-mute" strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 font-serif text-2xl text-ink">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-mute">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── trust / verification ─────────────────────────────────────────── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid items-start gap-14 lg:grid-cols-2">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="gold-rule" />
                <span className="spec-label !text-gold">Why 400+ buyers trusted us</span>
              </div>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                Trust is not a slogan here. It’s the process.
              </h2>
              <p className="mt-5 max-w-lg leading-relaxed text-white/70">
                Anybody can post a car online. We stake a nine-year reputation on every
                vehicle we hand over — which is why most of our business is repeat
                buyers and their referrals.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Independent inspection", "NTSA logbook verified", "Auction sheets shared", "Mileage certified"].map(
                  (t) => (
                    <span key={t} className="spec-chip !border-white/20">
                      {t}
                    </span>
                  ),
                )}
              </div>
            </Reveal>

            <div className="space-y-px bg-white/10">
              {[
                {
                  icon: BadgeCheck,
                  title: "Inspected before it’s listed",
                  body: "A third-party mechanic goes over every car — engine, suspension, electronics, accident history. The report is yours to read.",
                },
                {
                  icon: ShieldCheck,
                  title: "Your privacy by default",
                  body: "Inquire without a name or number. Track the reply with a code. Share your number only if you want a faster, personal response.",
                },
                {
                  icon: Handshake,
                  title: "One broker, start to finish",
                  body: "No call centre, no hand-offs. The person who answers your inquiry is the person who hands you the keys.",
                },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 100}>
                  <div className="flex gap-5 bg-ink p-7 md:p-8">
                    <f.icon className="mt-1 h-6 w-6 shrink-0 text-gold" strokeWidth={1.5} />
                    <div>
                      <h3 className="font-serif text-xl">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/65">{f.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── testimonials ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="gold-rule" />
            <span className="spec-label">From the logbook of happy owners</span>
          </div>
          <h2 className="mt-4 font-serif text-4xl text-ink md:text-5xl">
            Word travels fast in Nairobi.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="flex h-full flex-col border border-ink/10 bg-white p-7">
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 font-serif text-[17px] leading-relaxed text-ink">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-ink/10 pt-4">
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                    {t.detail}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── closing CTA ──────────────────────────────────────────────────── */}
      <section className="border-t border-ink/10 bg-sand-deep/60">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center md:px-8 md:py-28">
          <Reveal>
            <p className="spec-label">Ready when you are</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-balance font-serif text-4xl text-ink md:text-6xl">
              Your next car is one honest conversation away.
            </h2>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link to="/cars" className="btn-gold px-8">
                Browse cars in stock
              </Link>
              <InquiryDialog
                type="sourcing"
                carName="a specific car"
                trigger={<button className="btn-frame px-8">Ask the broker</button>}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
