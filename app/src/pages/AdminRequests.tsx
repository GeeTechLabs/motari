import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { RequestCar } from "@contracts/types";
import { BODY_TYPES } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type FormState = {
  make: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  bodyType: string;
  note: string;
  imageUrl: string;
  active: boolean;
};

const emptyForm: FormState = {
  make: "",
  model: "",
  yearFrom: "2018",
  yearTo: "2023",
  bodyType: "suv",
  note: "",
  imageUrl: "",
  active: true,
};

function rcToForm(rc: RequestCar): FormState {
  return {
    make: rc.make,
    model: rc.model,
    yearFrom: String(rc.yearFrom),
    yearTo: String(rc.yearTo),
    bodyType: rc.bodyType,
    note: rc.note ?? "",
    imageUrl: rc.imageUrl,
    active: rc.active,
  };
}

function RequestCarFormDialog({ rc, onDone }: { rc?: RequestCar; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(rc ? rcToForm(rc) : emptyForm);

  useEffect(() => {
    if (open) setForm(rc ? rcToForm(rc) : emptyForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const create = trpc.requestCars.create.useMutation({
    onSuccess: () => {
      toast.success("Added to source-on-request");
      setOpen(false);
      onDone();
    },
    onError: (e) => toast.error(e.message || "Could not save"),
  });
  const update = trpc.requestCars.update.useMutation({
    onSuccess: () => {
      toast.success("Updated");
      setOpen(false);
      onDone();
    },
    onError: (e) => toast.error(e.message || "Could not save"),
  });

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const payload = {
      make: form.make.trim(),
      model: form.model.trim(),
      yearFrom: Number(form.yearFrom),
      yearTo: Number(form.yearTo),
      bodyType: form.bodyType as never,
      note: form.note.trim() || undefined,
      imageUrl: form.imageUrl.trim(),
      active: form.active,
    };
    if (!payload.make || !payload.model || !payload.imageUrl) {
      toast.error("Make, model and image are required.");
      return;
    }
    if (rc) update.mutate({ id: rc.id, data: payload });
    else create.mutate(payload);
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {rc ? (
          <button
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-ink-mute hover:text-ink"
            aria-label={`Edit ${rc.make} ${rc.model}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : (
          <button className="btn-gold">
            <Plus className="h-4 w-4" />
            Add model
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto bg-sand p-0">
        <div className="p-7">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-normal text-ink">
              {rc ? `Edit ${rc.make} ${rc.model}` : "Add a sourceable model"}
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-ink-mute">
            Shown to visitors whose search misses your stock — without a price. The
            “Check price” button pings your inbox.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="spec-label !text-[10px]">Make</label>
              <Input value={form.make} onChange={(e) => set("make", e.target.value)} placeholder="Toyota" className="mt-1.5 h-11 border-ink/20 bg-white" />
            </div>
            <div>
              <label className="spec-label !text-[10px]">Model</label>
              <Input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Harrier" className="mt-1.5 h-11 border-ink/20 bg-white" />
            </div>
            <div>
              <label className="spec-label !text-[10px]">Years from</label>
              <Input type="number" value={form.yearFrom} onChange={(e) => set("yearFrom", e.target.value)} className="mt-1.5 h-11 border-ink/20 bg-white" />
            </div>
            <div>
              <label className="spec-label !text-[10px]">Years to</label>
              <Input type="number" value={form.yearTo} onChange={(e) => set("yearTo", e.target.value)} className="mt-1.5 h-11 border-ink/20 bg-white" />
            </div>
            <div>
              <label className="spec-label !text-[10px]">Body type</label>
              <Select value={form.bodyType} onValueChange={(v) => set("bodyType", v)}>
                <SelectTrigger className="mt-1.5 h-11 border-ink/20 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BODY_TYPES.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex cursor-pointer items-center gap-3 self-end border border-ink/15 bg-white p-3">
              <Checkbox
                checked={form.active}
                onCheckedChange={(v) => set("active", v === true)}
                className="h-5 w-5 border-ink/30 data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-ink"
              />
              <span className="text-sm text-ink">Visible to visitors</span>
            </label>
            <div className="sm:col-span-2">
              <label className="spec-label !text-[10px]">Image URL</label>
              <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="/cars/harrier.png or https://…" className="mt-1.5 h-11 border-ink/20 bg-white" />
            </div>
            <div className="sm:col-span-2">
              <label className="spec-label !text-[10px]">Note to buyers</label>
              <Textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={3} placeholder="Lead time, sourcing origin, inspection promise…" className="mt-1.5 border-ink/20 bg-white" />
            </div>
          </div>

          <button onClick={submit} disabled={pending} className="btn-gold mt-6 w-full disabled:opacity-60">
            {pending ? "Saving…" : rc ? "Save changes" : "Add model"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminRequests() {
  const utils = trpc.useUtils();
  const list = trpc.requestCars.adminList.useQuery();
  const remove = trpc.requestCars.remove.useMutation({
    onSuccess: () => {
      toast.success("Model removed");
      utils.requestCars.adminList.invalidate();
    },
  });

  const refresh = () => {
    utils.requestCars.adminList.invalidate();
    utils.requestCars.search.invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Sourced on request</h1>
          <p className="mt-1 text-sm text-ink-mute">
            The catalogue visitors see when your stock doesn’t have what they searched
            for. Demand (requests received) is tracked per model.
          </p>
        </div>
        <RequestCarFormDialog onDone={refresh} />
      </div>

      {list.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-none bg-sand-deep" />
          ))}
        </div>
      )}

      <div className="divide-y divide-ink/10 border border-ink/10 bg-white">
        {list.data?.map((rc) => (
          <div key={rc.id} className="flex flex-wrap items-center gap-4 p-4">
            <img
              src={rc.imageUrl}
              alt={`${rc.make} ${rc.model}`}
              className="h-16 w-24 shrink-0 bg-ink object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">
                {rc.make} {rc.model}{" "}
                <span className="font-normal text-ink-mute">
                  {rc.yearFrom}–{rc.yearTo}
                </span>
              </p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                {rc.active ? "Visible" : "Hidden"} · {rc.timesRequested} price check
                {rc.timesRequested === 1 ? "" : "s"}
              </p>
            </div>
            <RequestCarFormDialog rc={rc} onDone={refresh} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center text-ink-mute hover:text-destructive"
                  aria-label={`Delete ${rc.make} ${rc.model}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-sand">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-xl font-normal">
                    Remove {rc.make} {rc.model}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Visitors will no longer see it in search-miss results. You can
                    always add it back.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="min-h-[44px]">Keep it</AlertDialogCancel>
                  <AlertDialogAction
                    className="min-h-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => remove.mutate({ id: rc.id })}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}
