import { Link, useParams } from "react-router";
import { ArrowLeft, CalendarRange, CarFront, ClipboardCheck, Lock } from "lucide-react";
import { trpc } from "@/providers/trpc";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import InquiryDialog from "@/components/InquiryDialog";
import { Reveal } from "@/components/Reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { bodyTypeLabel } from "@/lib/format";

/**
 * On-request car detail. Intentionally shows NO price — the single
 * action on this page is "Check price", which pings the broker directly.
 */
export default function SourcedDetail() {
  const { id } = useParams<{ id: string }>();
  const rcId = Number(id);
  const query = trpc.requestCars.byId.useQuery({ id: rcId }, { enabled: Number.isFinite(rcId) });
  const rc = query.data;

  if (query.isLoading) {
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

  if (!rc) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-5 py-40 text-center md:px-8">
          <h1 className="font-serif text-4xl text-ink">Not available for sourcing right now.</h1>
          <Link to="/sourced" className="btn-frame mt-8">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sourced cars
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-32">
        <Link
          to="/sourced"
          className="inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-mute hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Sourced on request
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-6 md:px-8 lg:grid-cols-[1.25fr_1fr]">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden bg-ink">
            <img
              src={rc.imageUrl}
              alt={`${rc.make} ${rc.model}`}
              className="reveal-img h-full w-full object-cover opacity-95"
            />
            <span className="absolute left-5 top-5 spec-chip !border-gold/70 !text-gold">
              On request
            </span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div>
            <p className="spec-label">import on order · no listed price</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-5xl">
              {rc.make} {rc.model}
            </h1>

            <div className="mt-8 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10">
              <div className="bg-white p-4">
                <CalendarRange className="h-4 w-4 text-gold-deep" strokeWidth={1.5} />
                <p className="mt-2 spec-label !text-[10px]">Model years</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {rc.yearFrom} – {rc.yearTo}
                </p>
              </div>
              <div className="bg-white p-4">
                <CarFront className="h-4 w-4 text-gold-deep" strokeWidth={1.5} />
                <p className="mt-2 spec-label !text-[10px]">Body type</p>
                <p className="mt-1 text-sm font-semibold text-ink">{bodyTypeLabel(rc.bodyType)}</p>
              </div>
            </div>

            {rc.note && <p className="mt-7 leading-relaxed text-ink-mute">{rc.note}</p>}

            <div className="mt-8">
              <p className="text-sm text-ink-mute">
                Pricing depends on the exact unit, mileage and shipping month. Ask — the
                broker will reply with a current landed figure.
              </p>
              <InquiryDialog
                type="price_check"
                requestCarId={rc.id}
                carName={`${rc.make} ${rc.model}`}
                trigger={
                  <button className="btn-gold mt-4 w-full !min-h-[52px]">
                    <ClipboardCheck className="h-4 w-4" />
                    Check price
                  </button>
                }
              />
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                <Lock className="h-3 w-3" />
                Anonymous by default — share your number only if you want a call back
              </p>
            </div>

            {rc.timesRequested > 3 && (
              <p className="mt-6 border border-gold/40 bg-gold-soft/60 p-3 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-gold-deep">
                {rc.timesRequested} buyers asked about this model
              </p>
            )}
          </div>
        </Reveal>
      </div>

      <SiteFooter />
    </div>
  );
}
