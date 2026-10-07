import { Link } from "react-router";
import { ArrowRight, CarFront, ClipboardList, PackageSearch, Tag } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { formatDate, INQUIRY_STATUS } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const stats = trpc.inquiries.stats.useQuery();
  const recent = trpc.inquiries.adminList.useQuery({});

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-mute">
          The whole operation at a glance.
        </p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 lg:grid-cols-4">
        {[
          {
            icon: CarFront,
            label: "Cars in stock",
            value: stats.data?.cars.available,
            sub: `${stats.data?.cars.total ?? 0} listed total`,
          },
          {
            icon: Tag,
            label: "Sold via system",
            value: stats.data?.cars.sold,
            sub: "plus 400+ lifetime",
          },
          {
            icon: ClipboardList,
            label: "New inquiries",
            value: stats.data?.inquiries.new,
            sub: `${stats.data?.inquiries.total ?? 0} all time`,
          },
          {
            icon: PackageSearch,
            label: "Price checks",
            value: stats.data?.inquiries.priceChecks,
            sub: `${stats.data?.requestCars.total ?? 0} models on request`,
          },
        ].map((s) => (
          <div key={s.label} className="bg-white p-6">
            <s.icon className="h-5 w-5 text-gold-deep" strokeWidth={1.5} />
            {stats.isLoading ? (
              <Skeleton className="mt-3 h-9 w-16 rounded-none bg-sand-deep" />
            ) : (
              <p className="mt-3 font-serif text-4xl text-ink">{s.value ?? 0}</p>
            )}
            <p className="mt-1 spec-label !text-[10px]">{s.label}</p>
            <p className="mt-0.5 text-xs text-ink-mute">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* recent inquiries */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-ink">Latest inquiries</h2>
          <Link
            to="/admin/inquiries"
            className="flex min-h-[44px] items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold-deep hover:text-ink"
          >
            Open inbox <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-ink/10 border border-ink/10 bg-white">
          {recent.isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5">
                <Skeleton className="h-4 w-2/3 rounded-none bg-sand-deep" />
              </div>
            ))}
          {recent.data?.length === 0 && (
            <p className="p-8 text-center text-sm text-ink-mute">
              No inquiries yet — they’ll land here the moment a visitor reaches out.
            </p>
          )}
          {recent.data?.slice(0, 5).map((inq) => (
            <Link
              key={inq.id}
              to="/admin/inquiries"
              className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-sand/60"
            >
              <span className="font-mono text-[11px] tracking-[0.1em] text-ink-mute">
                {inq.referenceCode}
              </span>
              <span className="spec-chip-dark !border-gold/50 !text-gold-deep">
                {inq.type === "price_check"
                  ? "Price check"
                  : inq.type === "inquiry"
                    ? "Inquiry"
                    : "Sourcing"}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                {inq.carName ?? inq.subject ?? "General request"}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-mute">
                {INQUIRY_STATUS[inq.status].label} · {formatDate(inq.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
