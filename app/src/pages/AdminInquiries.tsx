import { useState } from "react";
import { Lock, Phone } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { formatDate, INQUIRY_STATUS } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TYPE_LABELS = {
  inquiry: "Inquiry",
  price_check: "Price check",
  sourcing: "Sourcing",
} as const;

export default function AdminInquiries() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const utils = trpc.useUtils();

  const list = trpc.inquiries.adminList.useQuery(
    statusFilter === "all" ? {} : { status: statusFilter as never },
  );

  const update = trpc.inquiries.update.useMutation({
    onSuccess: () => {
      utils.inquiries.adminList.invalidate();
      utils.inquiries.stats.invalidate();
      toast.success("Inquiry updated");
    },
    onError: () => toast.error("Update failed"),
  });

  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Inquiries inbox</h1>
          <p className="mt-1 text-sm text-ink-mute">
            Every “Check price”, inquiry and sourcing request lands here. Phone numbers
            only appear when the visitor chose to share them.
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 w-44 border-ink/20 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(INQUIRY_STATUS).map(([v, s]) => (
              <SelectItem key={v} value={v}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {list.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-none bg-sand-deep" />
          ))}
        </div>
      )}

      {list.data?.length === 0 && (
        <div className="border border-dashed border-ink/20 p-14 text-center">
          <p className="font-serif text-xl text-ink">Inbox zero.</p>
          <p className="mt-1 text-sm text-ink-mute">
            No inquiries with this status right now.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {list.data?.map((inq) => (
          <article key={inq.id} className="border border-ink/10 bg-white">
            <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-5 py-3.5">
              <span className="font-mono text-[12px] tracking-[0.1em] text-ink">
                {inq.referenceCode}
              </span>
              <span className="spec-chip-dark !border-gold/50 !text-gold-deep">
                {TYPE_LABELS[inq.type]}
              </span>
              <span className="text-sm font-semibold text-ink">
                {inq.carName ?? inq.subject ?? "General request"}
              </span>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-ink-mute">
                {formatDate(inq.createdAt)}
              </span>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-[1.2fr_1fr]">
              <div className="space-y-3">
                {inq.message ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                    {inq.message}
                  </p>
                ) : (
                  <p className="text-sm italic text-ink-mute">
                    No message — just a {TYPE_LABELS[inq.type].toLowerCase()} ping.
                  </p>
                )}

                {/* privacy-first contact display */}
                {inq.sharePhone && inq.phone ? (
                  <p className="flex items-center gap-2 border border-gold/40 bg-gold-soft/50 px-3 py-2 text-sm font-semibold text-ink">
                    <Phone className="h-3.5 w-3.5 text-gold-deep" />
                    {inq.phone}
                    <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.12em] text-gold-deep">
                      opted in
                    </span>
                  </p>
                ) : (
                  <p className="flex items-center gap-2 border border-ink/10 bg-sand px-3 py-2 text-sm text-ink-mute">
                    <Lock className="h-3.5 w-3.5" />
                    Contact details private — reply here, the visitor tracks with their
                    code.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="spec-label !text-[10px]">Status</span>
                  <Select
                    value={inq.status}
                    onValueChange={(v) =>
                      update.mutate({ id: inq.id, status: v as never })
                    }
                  >
                    <SelectTrigger className="h-10 w-40 border-ink/20 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INQUIRY_STATUS).map(([v, s]) => (
                        <SelectItem key={v} value={v}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  placeholder="Write the reply the visitor will see on their tracking page…"
                  rows={3}
                  className="border-ink/20 bg-white text-sm"
                  value={replyDrafts[inq.id] ?? inq.brokerReply ?? ""}
                  onChange={(e) =>
                    setReplyDrafts((d) => ({ ...d, [inq.id]: e.target.value }))
                  }
                />
                <button
                  disabled={update.isPending}
                  onClick={() =>
                    update.mutate({
                      id: inq.id,
                      brokerReply: replyDrafts[inq.id] ?? inq.brokerReply ?? "",
                    })
                  }
                  className={cn("btn-frame !min-h-[42px] w-full", update.isPending && "opacity-60")}
                >
                  Save reply
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
