import { Link } from "react-router";
import type { Car } from "@contracts/types";
import { formatKES, formatKm, carTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Full-bleed image tile with gradient overlay — entire tile is clickable.
 */
export default function CarCard({ car, className }: { car: Car; className?: string }) {
  const sold = car.status === "sold";
  return (
    <Link
      to={`/cars/${car.id}`}
      className={cn(
        "group relative block overflow-hidden bg-ink aspect-[4/3] focus-visible:outline-2 focus-visible:outline-gold",
        className,
      )}
    >
      <img
        src={car.imageUrl}
        alt={carTitle(car)}
        loading="lazy"
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]",
          sold && "grayscale",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />

      {/* status ribbon */}
      {car.status !== "available" && (
        <span className="absolute right-4 top-4 spec-chip !border-gold/60 !text-gold">
          {car.status === "sold" ? "Sold" : "Reserved"}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="spec-chip">{car.year}</span>
          <span className="spec-chip">{formatKm(car.mileage)}</span>
          <span className="spec-chip">{car.fuelType}</span>
          <span className="spec-chip">{car.transmission}</span>
        </div>
        <h3 className="mt-3 font-serif text-xl leading-tight text-white md:text-2xl">
          {carTitle(car)}
        </h3>
        <p className="mt-2 font-mono text-[13px] tracking-[0.06em] text-gold">
          {sold ? "SOLD" : formatKES(car.price)}
        </p>
      </div>
    </Link>
  );
}
