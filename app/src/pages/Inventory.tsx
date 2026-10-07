import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { ArrowUpRight, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { trpc } from "@/providers/trpc";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CarCard from "@/components/CarCard";
import RequestCarCard from "@/components/RequestCarCard";
import InquiryDialog from "@/components/InquiryDialog";
import { Reveal } from "@/components/Reveal";
import { BODY_TYPES } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const PRICE_OPTIONS = [
  { value: "1500000", label: "Under KES 1.5M" },
  { value: "2500000", label: "Under KES 2.5M" },
  { value: "3500000", label: "Under KES 3.5M" },
  { value: "5000000", label: "Under KES 5M" },
  { value: "10000000", label: "Under KES 10M" },
];

export default function Inventory() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [make, setMake] = useState<string>("all");
  const [bodyType, setBodyType] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("all");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const urlQ = params.get("q") ?? "";
    if (urlQ !== q) setQ(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const queryInput = useMemo(
    () => ({
      q: debouncedQ || undefined,
      make: make === "all" ? undefined : make,
      bodyType: bodyType === "all" ? undefined : (bodyType as never),
      maxPrice: maxPrice === "all" ? undefined : Number(maxPrice),
    }),
    [debouncedQ, make, bodyType, maxPrice],
  );

  const carsQuery = trpc.cars.list.useQuery(queryInput);
  const makesQuery = trpc.cars.makes.useQuery();

  const stockResults = carsQuery.data ?? [];
  const searching = debouncedQ.length > 0;
  const noStockHits = !carsQuery.isLoading && stockResults.length === 0;

  // When the searched car isn't in stock → show sourceable cards (no price)
  const requestQuery = trpc.requestCars.search.useQuery(
    { q: debouncedQ || undefined },
    { enabled: noStockHits && searching },
  );
  const requestMatches = requestQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="bg-ink pb-14 pt-28 text-white md:pt-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="spec-label !text-gold">Motari Motors · Yard stock</p>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl">Cars in stock</h1>
          <p className="mt-3 max-w-xl text-white/70">
            Physically available, inspected, priced as-is. What you see is what you
            drive away.
          </p>

          {/* search + filters */}
          <div className="mt-8 grid gap-3 md:grid-cols-[1fr_repeat(3,180px)]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setParams(e.target.value.trim() ? { q: e.target.value.trim() } : {}, { replace: true });
                }}
                placeholder="Search make or model — try “Harrier”…"
                className="h-12 w-full bg-sand pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-mute/70 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <Select value={make} onValueChange={setMake}>
              <SelectTrigger className="h-12 border-ink/20 bg-sand text-ink">
                <SelectValue placeholder="Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All makes</SelectItem>
                {makesQuery.data?.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={bodyType} onValueChange={setBodyType}>
              <SelectTrigger className="h-12 border-ink/20 bg-sand text-ink">
                <SelectValue placeholder="Body type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All body types</SelectItem>
                {BODY_TYPES.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={maxPrice} onValueChange={setMaxPrice}>
              <SelectTrigger className="h-12 border-ink/20 bg-sand text-ink">
                <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any budget</SelectItem>
                {PRICE_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        {/* loading */}
        {carsQuery.isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-none bg-sand-deep" />
            ))}
          </div>
        )}

        {/* stock results */}
        {!carsQuery.isLoading && stockResults.length > 0 && (
          <>
            <p className="spec-label mb-6">
              {stockResults.length} car{stockResults.length === 1 ? "" : "s"}
              {searching ? ` matching “${debouncedQ}”` : " available"}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stockResults.map((car, i) => (
                <Reveal key={car.id} delay={Math.min(i, 5) * 70}>
                  <CarCard car={car} />
                </Reveal>
              ))}
            </div>
          </>
        )}

        {/* ── search miss → source-on-request cards (no price) ── */}
        {noStockHits && searching && (
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <SearchX className="mx-auto h-8 w-8 text-gold-deep" strokeWidth={1.5} />
              <h2 className="mt-4 font-serif text-3xl text-ink md:text-4xl">
                “{debouncedQ}” isn’t in the yard today.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-ink-mute">
                {requestMatches.length > 0
                  ? "But it’s exactly the kind of car we source on order. No price is listed online — ask, and the broker replies to you directly."
                  : "No stock match — but sourcing cars like this is our day job. Send one request and the broker will come back with options and a landed price."}
              </p>
            </div>

            {requestQuery.isLoading && (
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                <Skeleton className="aspect-[4/3] rounded-none bg-sand-deep" />
                <Skeleton className="aspect-[4/3] rounded-none bg-sand-deep" />
              </div>
            )}

            {requestMatches.length > 0 && (
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {requestMatches.map((rc) => (
                  <RequestCarCard key={rc.id} car={rc} />
                ))}
              </div>
            )}

            <div className="mt-10 border border-ink/15 bg-white p-7 text-center">
              <p className="font-serif text-xl text-ink">
                Tell the broker exactly what you want
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-mute">
                Year, budget, colour — the more specific, the sharper the quote. No
                personal details needed.
              </p>
              <InquiryDialog
                type="sourcing"
                carName={debouncedQ}
                defaultSubject={debouncedQ}
                trigger={
                  <button className="btn-gold mt-5">
                    Request “{debouncedQ}”
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                }
              />
            </div>
          </div>
        )}

        {/* no filters matched at all (no search term) */}
        {noStockHits && !searching && (
          <div className="py-16 text-center">
            <p className="font-serif text-2xl text-ink">Nothing matches those filters.</p>
            <p className="mt-2 text-ink-mute">Try widening the budget or clearing the filters.</p>
            <button
              className="btn-frame mt-6"
              onClick={() => {
                setMake("all");
                setBodyType("all");
                setMaxPrice("all");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
