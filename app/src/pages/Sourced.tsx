import { ArrowUpRight } from "lucide-react";
import { trpc } from "@/providers/trpc";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RequestCarCard from "@/components/RequestCarCard";
import InquiryDialog from "@/components/InquiryDialog";
import { Reveal } from "@/components/Reveal";
import { Skeleton } from "@/components/ui/skeleton";

export default function Sourced() {
  const query = trpc.requestCars.search.useQuery({});

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="bg-ink pb-14 pt-28 text-white md:pt-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="spec-label !text-gold">Import on order</p>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl">Sourced on request</h1>
          <p className="mt-3 max-w-xl text-white/70">
            Cars we bring in on order from Japan and the UK. Prices depend on the exact
            unit, mileage and month — so we don’t list them. One tap sends your request
            straight to the broker.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        {query.isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-none bg-sand-deep" />
            ))}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {query.data?.map((rc, i) => (
            <Reveal key={rc.id} delay={Math.min(i, 5) * 70}>
              <RequestCarCard car={rc} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 border border-ink/15 bg-white p-8 text-center">
          <h2 className="font-serif text-2xl text-ink">Something else in mind?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-mute">
            If it has wheels and a logbook, we can find it. Describe the car and the
            broker will reply with options and landed pricing.
          </p>
          <InquiryDialog
            type="sourcing"
            carName="a specific car"
            trigger={
              <button className="btn-gold mt-5">
                Request a car
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            }
          />
        </Reveal>
      </div>

      <SiteFooter />
    </div>
  );
}
