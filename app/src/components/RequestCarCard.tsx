import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { RequestCar } from "@contracts/types";
import { cn } from "@/lib/utils";

/**
 * "Available on request" tile — deliberately shows NO price.
 * The single action on the detail page is "Check price".
 */
export default function RequestCarCard({
  car,
  className,
}: {
  car: RequestCar;
  className?: string;
}) {
  return (
    <Link
      to={`/sourced/${car.id}`}
      className={cn(
        "group relative block overflow-hidden bg-ink aspect-[4/3] focus-visible:outline-2 focus-visible:outline-gold",
        className,
      )}
    >
      <img
        src={car.imageUrl}
        alt={`${car.make} ${car.model}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.045]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/30" />

      <span className="absolute left-4 top-4 spec-chip !border-gold/70 !text-gold">
        On request
      </span>

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="spec-chip">
            {car.yearFrom}–{car.yearTo}
          </span>
          <span className="spec-chip">{car.bodyType}</span>
        </div>
        <h3 className="mt-3 font-serif text-xl leading-tight text-white md:text-2xl">
          {car.make} {car.model}
        </h3>
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/70 transition-colors group-hover:text-gold">
          Check price
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}
