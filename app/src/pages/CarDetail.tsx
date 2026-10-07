import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Cog,
  Fuel,
  Gauge,
  MessageSquare,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CarCard from "@/components/CarCard";
import InquiryDialog from "@/components/InquiryDialog";
import { Reveal } from "@/components/Reveal";
import { formatKES, formatKm, carTitle } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const carId = Number(id);
  const carQuery = trpc.cars.byId.useQuery({ id: carId }, { enabled: Number.isFinite(carId) });
  const moreQuery = trpc.cars.list.useQuery({});

  const car = carQuery.data;
  const moreCars = (moreQuery.data ?? []).filter((c) => c.id !== carId).slice(0, 3);

  if (carQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-8 md:pt-36">
          <Skeleton className="h-[50vh] w-full rounded-none bg-sand-deep" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-5 py-40 text-center md:px-8">
          <h1 className="font-serif text-4xl text-ink">This car has moved on.</h1>
          <p className="mt-3 text-ink-mute">It may have been sold or delisted.</p>
          <Link to="/cars" className="btn-frame mt-8">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to stock
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const sold = car.status === "sold";
  const specs = [
    { icon: Calendar, label: "Year", value: String(car.year) },
    { icon: Gauge, label: "Mileage", value: formatKm(car.mileage) },
    { icon: Fuel, label: "Fuel", value: car.fuelType },
    { icon: Cog, label: "Transmission", value: car.transmission },
    { icon: Palette, label: "Colour", value: car.color },
    { icon: BadgeCheck, label: "Engine", value: car.engineCc ? `${car.engineCc.toLocaleString()} cc` : "—" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-32">
        <Link
          to="/cars"
          className="inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-mute hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All cars in stock
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-6 md:px-8 lg:grid-cols-[1.25fr_1fr]">
        {/* image */}
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden bg-ink">
            <img
              src={car.imageUrl}
              alt={carTitle(car)}
              className="reveal-img h-full w-full object-cover"
            />
            {car.status !== "available" && (
              <span className="absolute right-5 top-5 spec-chip !border-gold/60 !text-gold">
                {sold ? "Sold" : "Reserved"}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Inspection report available", "Logbook verified", "Mileage certified"].map((t) => (
              <span key={t} className="spec-chip-dark flex items-center gap-1.5 !py-1.5">
                <ShieldCheck className="h-3 w-3 text-gold-deep" />
                {t}
              </span>
            ))}
          </div>
        </Reveal>

        {/* details */}
        <Reveal delay={120}>
          <div>
            <p className="spec-label">{car.bodyType} · in stock</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-5xl">
              {carTitle(car)}
            </h1>
            <p className="mt-4 font-serif text-3xl text-gold-deep">
              {sold ? "Sold" : formatKES(car.price)}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3">
              {specs.map((s) => (
                <div key={s.label} className="bg-white p-4">
                  <s.icon className="h-4 w-4 text-gold-deep" strokeWidth={1.5} />
                  <p className="mt-2 spec-label !text-[10px]">{s.label}</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-ink">{s.value}</p>
                </div>
              ))}
            </div>

            {car.description && (
              <p className="mt-7 leading-relaxed text-ink-mute">{car.description}</p>
            )}

            <div className="mt-8 space-y-3">
              {sold ? (
                <p className="border border-ink/15 bg-sand-deep/50 p-4 text-sm text-ink-mute">
                  This one found its owner. Browse the rest of the yard — or let us
                  source one just like it.
                </p>
              ) : (
                <InquiryDialog
                  type="inquiry"
                  carId={car.id}
                  carName={carTitle(car)}
                  trigger={
                    <button className="btn-gold w-full !min-h-[52px]">
                      <MessageSquare className="h-4 w-4" />
                      Inquire about this car
                    </button>
                  }
                />
              )}
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                No account · no details shared unless you opt in
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* more from the yard */}
      {moreCars.length > 0 && (
        <section className="border-t border-ink/10 bg-sand-deep/50">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-serif text-3xl text-ink">More from the yard</h2>
              <Link to="/cars" className="btn-frame hidden sm:inline-flex">
                View all
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {moreCars.map((c) => (
                <CarCard key={c.id} car={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
