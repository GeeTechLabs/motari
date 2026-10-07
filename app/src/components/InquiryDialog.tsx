import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Check, Copy, Lock, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";

type Props = {
  trigger: ReactNode;
  type: "inquiry" | "price_check" | "sourcing";
  carId?: number;
  requestCarId?: number;
  carName: string;
  defaultSubject?: string;
};

/**
 * Privacy-first inquiry dialog.
 * - No account, no name, no email collected. Ever.
 * - Phone number is ONLY sent when the visitor ticks the opt-in box.
 * - Anonymous inquiries are tracked with a reference code.
 */
export default function InquiryDialog({ trigger, type, carId, requestCarId, carName, defaultSubject }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState(defaultSubject ?? "");
  const [sharePhone, setSharePhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [refCode, setRefCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const create = trpc.inquiries.create.useMutation({
    onSuccess: (data) => setRefCode(data.referenceCode),
  });

  useEffect(() => {
    if (!open) {
      // reset when closed (after transition)
      const t = setTimeout(() => {
        setRefCode(null);
        setMessage("");
        setSubject(defaultSubject ?? "");
        setSharePhone(false);
        setPhone("");
        setPhoneError("");
        setCopied(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open, defaultSubject]);

  const submit = () => {
    if (sharePhone && phone.trim().length < 7) {
      setPhoneError("Please enter a valid phone number, or untick the box.");
      return;
    }
    setPhoneError("");
    create.mutate({
      type,
      carId,
      requestCarId,
      subject: type === "sourcing" ? subject || carName : undefined,
      message: message || undefined,
      sharePhone,
      phone: sharePhone ? phone.trim() : undefined,
    });
  };

  const copy = async () => {
    if (!refCode) return;
    try {
      await navigator.clipboard.writeText(refCode);
    } catch {
      /* clipboard unavailable — code is visible anyway */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const titles = {
    inquiry: `Inquire about the ${carName}`,
    price_check: `Check price — ${carName}`,
    sourcing: "Tell us what you're looking for",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md border-ink/10 bg-sand p-0">
        {refCode ? (
          /* ── success state ── */
          <div className="p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15">
              <Check className="h-5 w-5 text-gold-deep" />
            </div>
            <h3 className="mt-4 font-serif text-2xl text-ink">
              Sent. The broker has your request.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-mute">
              {sharePhone
                ? "Expect a call or text shortly — usually within the hour during business hours."
                : "You shared no personal details, so the reply lives here. Keep your reference code and check back any time."}
            </p>

            <div className="mt-5 border border-ink/15 bg-white p-4">
              <p className="spec-label">Your reference code</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="font-mono text-xl tracking-[0.12em] text-ink">{refCode}</span>
                <button
                  onClick={copy}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 border border-ink/20 px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-sand"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <Link
              to={`/track?ref=${refCode}`}
              onClick={() => setOpen(false)}
              className="btn-frame mt-5 w-full"
            >
              Track this inquiry
            </Link>
          </div>
        ) : (
          /* ── form state ── */
          <div className="p-7">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-normal text-ink">
                {titles[type]}
              </DialogTitle>
              <DialogDescription className="flex items-start gap-2 pt-1 text-[13px] leading-relaxed text-ink-mute">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" />
                No account needed. Your name and number stay private unless you
                choose to share them below.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-4">
              {type === "sourcing" && (
                <div>
                  <label className="spec-label" htmlFor="inq-subject">
                    Car you want
                  </label>
                  <Input
                    id="inq-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Toyota Noah, 2019 or newer"
                    className="mt-2 h-11 border-ink/20 bg-white"
                  />
                </div>
              )}

              {type !== "price_check" && (
                <div>
                  <label className="spec-label" htmlFor="inq-message">
                    Message <span className="normal-case tracking-normal">(optional)</span>
                  </label>
                  <Textarea
                    id="inq-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      type === "sourcing"
                        ? "Budget, preferred year, fuel type…"
                        : "Ask about viewing, trade-in, financing…"
                    }
                    rows={3}
                    className="mt-2 border-ink/20 bg-white"
                  />
                </div>
              )}

              {/* the single privacy opt-in */}
              <label
                htmlFor="inq-share"
                className="flex cursor-pointer items-start gap-3 border border-ink/15 bg-white p-4"
              >
                <Checkbox
                  id="inq-share"
                  checked={sharePhone}
                  onCheckedChange={(v) => setSharePhone(v === true)}
                  className="mt-0.5 h-5 w-5 border-ink/30 data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-ink"
                />
                <span className="text-[13px] leading-snug text-ink">
                  Share my number with the broker for a{" "}
                  <span className="font-semibold">faster response</span> to my inquiry.
                </span>
              </label>

              {sharePhone && (
                <div>
                  <label className="spec-label" htmlFor="inq-phone">
                    Your phone number
                  </label>
                  <Input
                    id="inq-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07xx xxx xxx"
                    className="mt-2 h-11 border-ink/20 bg-white"
                    autoFocus
                  />
                  {phoneError && (
                    <p className="mt-1.5 text-xs text-destructive">{phoneError}</p>
                  )}
                </div>
              )}

              {create.isError && (
                <p className="text-sm text-destructive">
                  Something went wrong sending your request. Please try again.
                </p>
              )}

              <button
                onClick={submit}
                disabled={create.isPending}
                className="btn-gold w-full disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                {create.isPending
                  ? "Sending…"
                  : type === "price_check"
                    ? "Send price request"
                    : "Send to the broker"}
              </button>

              <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                {sharePhone
                  ? "Only your number is shared — nothing else"
                  : "Fully anonymous — reply arrives on the tracking page"}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
