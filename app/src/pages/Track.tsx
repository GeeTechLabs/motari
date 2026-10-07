import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { CircleDashed, Loader2, MailCheck, PackageCheck, Search } from "lucide-react";
import { trpc } from "@/providers/trpc";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { formatDate, INQUIRY_STATUS } from "@/lib/format";

const STATUS_STEPS = ["new", "in_progress", "replied", "closed"] as const;
const STEP_ICONS = [CircleDashed, Loader2, MailCheck, PackageCheck];

export default function Track() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get("ref") ?? "");
  const [submitted, setSubmitted] = useState((params.get("ref") ?? "").length >= 4);

  const query = trpc.inquiries.track.useQuery(
    { referenceCode: code.trim().toUpperCase() },
    { enabled: submitted && code.trim().length >= 4, retry: false },
  );

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) {
      setCode(ref);
      setSubmitted(true);
    }
  }, [params]);

  const result = query.data;
  const activeStep = result ? STATUS_STEPS.indexOf(result.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="bg-ink pb-14 pt-28 text-white md:pt-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="spec-label !text-gold">Private by design</p>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl">Track your inquiry</h1>
          <p className="mt-3 max-w-xl text-white/70">
            If you asked about a car without sharing your number, this is where the
            broker’s reply lands. Enter the reference code you were given.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-14 md:py-20">
        <form
          className="flex"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim().length >= 4) setSubmitted(true);
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setSubmitted(false);
              }}
              placeholder="MM-XXXXXX"
              className="h-14 w-full border border-ink/20 bg-white pl-11 pr-4 font-mono text-lg tracking-[0.14em] text-ink placeholder:text-ink-mute/50 focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <button type="submit" className="btn-gold h-14 !min-h-0 px-7">
            Track
          </button>
        </form>

        {/* states */}
        {submitted && query.isLoading && (
          <p className="mt-10 text-center font-mono text-[12px] uppercase tracking-[0.14em] text-ink-mute">
            Looking up {code}…
          </p>
        )}

        {submitted && query.isError && (
          <div className="mt-10 border border-ink/15 bg-white p-7 text-center">
            <p className="font-serif text-xl text-ink">We couldn’t find that reference.</p>
            <p className="mt-2 text-sm text-ink-mute">
              Check the code — it looks like <span className="font-mono">MM-ABC123</span>. If
              you’ve lost it, simply send a fresh inquiry.
            </p>
          </div>
        )}

        {result && (
          <div className="mt-10 space-y-5">
            <div className="border border-ink/15 bg-white p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="spec-label">Reference</p>
                  <p className="mt-1 font-mono text-xl tracking-[0.12em] text-ink">
                    {result.referenceCode}
                  </p>
                </div>
                <span className="spec-chip-dark !border-gold/50 !text-gold-deep">
                  {INQUIRY_STATUS[result.status].label}
                </span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-ink-mute">
                <p>
                  <span className="font-semibold text-ink">About:</span>{" "}
                  {result.carName ?? result.subject ?? "General sourcing request"}
                </p>
                <p>
                  <span className="font-semibold text-ink">Sent:</span>{" "}
                  {formatDate(result.createdAt)}
                </p>
                <p>
                  <span className="font-semibold text-ink">Type:</span>{" "}
                  {result.type === "price_check"
                    ? "Price check"
                    : result.type === "inquiry"
                      ? "Car inquiry"
                      : "Sourcing request"}
                </p>
              </div>

              {/* progress */}
              <div className="mt-7 flex items-center">
                {STATUS_STEPS.map((s, i) => {
                  const Icon = STEP_ICONS[i];
                  const reached = i <= activeStep;
                  return (
                    <div key={s} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <Icon
                          className={`h-5 w-5 ${reached ? "text-gold-deep" : "text-ink/20"}`}
                          strokeWidth={1.75}
                        />
                        <span
                          className={`font-mono text-[9px] uppercase tracking-[0.1em] ${
                            reached ? "text-ink" : "text-ink/30"
                          }`}
                        >
                          {INQUIRY_STATUS[s].label}
                        </span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div
                          className={`mx-2 mb-5 h-px flex-1 ${i < activeStep ? "bg-gold" : "bg-ink/15"}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* broker reply */}
            <div className="border border-ink/15 bg-white p-7">
              <p className="spec-label">Broker’s reply</p>
              {result.brokerReply ? (
                <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">
                  {result.brokerReply}
                </p>
              ) : (
                <p className="mt-3 text-sm text-ink-mute">
                  No reply yet — most inquiries get answered within 24 hours. Keep this
                  code and check back.
                </p>
              )}
            </div>
          </div>
        )}

        {!submitted && !result && (
          <div className="mt-10 border border-dashed border-ink/20 p-7 text-center text-sm text-ink-mute">
            Your reference code was shown right after you sent your inquiry — it looks
            like <span className="font-mono text-ink">MM-7K2P9Q</span>.
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
