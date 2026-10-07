import { useEffect, useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { Car } from "@contracts/types";
import { formatKES, formatKm, carTitle, BODY_TYPES } from "@/lib/format";
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
  year: string;
  price: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  engineCc: string;
  description: string;
  imageUrl: string;
  status: string;
  featured: boolean;
};

const emptyForm: FormState = {
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  price: "",
  mileage: "",
  fuelType: "petrol",
  transmission: "automatic",
  bodyType: "suv",
  color: "",
  engineCc: "",
  description: "",
  imageUrl: "",
  status: "available",
  featured: false,
};

function carToForm(car: Car): FormState {
  return {
    make: car.make,
    model: car.model,
    year: String(car.year),
    price: String(car.price),
    mileage: String(car.mileage),
    fuelType: car.fuelType,
    transmission: car.transmission,
    bodyType: car.bodyType,
    color: car.color,
    engineCc: car.engineCc ? String(car.engineCc) : "",
    description: car.description ?? "",
    imageUrl: car.imageUrl,
    status: car.status,
    featured: car.featured,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="spec-label !text-[10px]">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function CarFormDialog({ car, onDone }: { car?: Car; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(car ? carToForm(car) : emptyForm);

  useEffect(() => {
    if (open) setForm(car ? carToForm(car) : emptyForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const create = trpc.cars.create.useMutation({
    onSuccess: () => {
      toast.success("Car added to stock");
      setOpen(false);
      onDone();
    },
    onError: (e) => toast.error(e.message || "Could not save"),
  });
  const update = trpc.cars.update.useMutation({
    onSuccess: () => {
      toast.success("Car updated");
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
      year: Number(form.year),
      price: Number(form.price.replace(/[^\d]/g, "")),
      mileage: Number(form.mileage.replace(/[^\d]/g, "")),
      fuelType: form.fuelType as never,
      transmission: form.transmission as never,
      bodyType: form.bodyType as never,
      color: form.color.trim(),
      engineCc: form.engineCc ? Number(form.engineCc) : undefined,
      description: form.description.trim() || undefined,
      imageUrl: form.imageUrl.trim(),
      status: form.status as never,
      featured: form.featured,
    };
    if (!payload.make || !payload.model || !payload.price || !payload.imageUrl) {
      toast.error("Make, model, price and image are required.");
      return;
    }
    if (car) update.mutate({ id: car.id, data: payload });
    else create.mutate(payload);
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {car ? (
          <button
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-ink-mute hover:text-ink"
            aria-label={`Edit ${carTitle(car)}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : (
          <button className="btn-gold">
            <Plus className="h-4 w-4" />
            Add car
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-sand p-0">
        <div className="p-7">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-normal text-ink">
              {car ? `Edit ${carTitle(car)}` : "Add a car to stock"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Make">
              <Input value={form.make} onChange={(e) => set("make", e.target.value)} placeholder="Toyota" className="h-11 border-ink/20 bg-white" />
            </Field>
            <Field label="Model">
              <Input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Land Cruiser Prado TX-L" className="h-11 border-ink/20 bg-white" />
            </Field>
            <Field label="Year">
              <Input type="number" value={form.year} onChange={(e) => set("year", e.target.value)} className="h-11 border-ink/20 bg-white" />
            </Field>
            <Field label="Price (KES)">
              <Input inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="3,250,000" className="h-11 border-ink/20 bg-white" />
            </Field>
            <Field label="Mileage (km)">
              <Input inputMode="numeric" value={form.mileage} onChange={(e) => set("mileage", e.target.value)} placeholder="54,000" className="h-11 border-ink/20 bg-white" />
            </Field>
            <Field label="Colour">
              <Input value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="Pearl White" className="h-11 border-ink/20 bg-white" />
            </Field>
            <Field label="Fuel">
              <Select value={form.fuelType} onValueChange={(v) => set("fuelType", v)}>
                <SelectTrigger className="h-11 border-ink/20 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["petrol", "diesel", "hybrid", "electric"].map((f) => (
                    <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Transmission">
              <Select value={form.transmission} onValueChange={(v) => set("transmission", v)}>
                <SelectTrigger className="h-11 border-ink/20 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Body type">
              <Select value={form.bodyType} onValueChange={(v) => set("bodyType", v)}>
                <SelectTrigger className="h-11 border-ink/20 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BODY_TYPES.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Engine (cc)">
              <Input type="number" value={form.engineCc} onChange={(e) => set("engineCc", e.target.value)} placeholder="2000" className="h-11 border-ink/20 bg-white" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Image URL">
                <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="/cars/prado.png or https://…" className="h-11 border-ink/20 bg-white" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Description">
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="border-ink/20 bg-white" />
              </Field>
            </div>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="h-11 border-ink/20 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <label className="flex cursor-pointer items-center gap-3 self-end border border-ink/15 bg-white p-3">
              <Checkbox
                checked={form.featured}
                onCheckedChange={(v) => set("featured", v === true)}
                className="h-5 w-5 border-ink/30 data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-ink"
              />
              <span className="text-sm text-ink">Feature on homepage</span>
            </label>
          </div>

          <button onClick={submit} disabled={pending} className="btn-gold mt-6 w-full disabled:opacity-60">
            {pending ? "Saving…" : car ? "Save changes" : "Add to stock"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCars() {
  const utils = trpc.useUtils();
  const list = trpc.cars.adminList.useQuery();
  const remove = trpc.cars.remove.useMutation({
    onSuccess: () => {
      toast.success("Car removed");
      utils.cars.adminList.invalidate();
    },
  });
  const setStatus = trpc.cars.update.useMutation({
    onSuccess: () => utils.cars.adminList.invalidate(),
  });

  const refresh = () => {
    utils.cars.adminList.invalidate();
    utils.cars.list.invalidate();
    utils.cars.featured.invalidate();
    utils.cars.makes.invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Cars in stock</h1>
          <p className="mt-1 text-sm text-ink-mute">
            Add, edit, mark reserved or sold. Changes go live instantly.
          </p>
        </div>
        <CarFormDialog onDone={refresh} />
      </div>

      {list.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-none bg-sand-deep" />
          ))}
        </div>
      )}

      {list.data?.length === 0 && (
        <div className="border border-dashed border-ink/20 p-14 text-center">
          <p className="font-serif text-xl text-ink">The yard is empty.</p>
          <p className="mt-1 text-sm text-ink-mute">Add your first car to get started.</p>
        </div>
      )}

      <div className="divide-y divide-ink/10 border border-ink/10 bg-white">
        {list.data?.map((car) => (
          <div key={car.id} className="flex flex-wrap items-center gap-4 p-4">
            <img
              src={car.imageUrl}
              alt={carTitle(car)}
              className="h-16 w-24 shrink-0 bg-ink object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold text-ink">
                {car.featured && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}
                {carTitle(car)} <span className="font-normal text-ink-mute">({car.year})</span>
              </p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                {formatKES(car.price)} · {formatKm(car.mileage)} · {car.fuelType}
              </p>
            </div>
            <Select
              value={car.status}
              onValueChange={(v) =>
                setStatus.mutate({ id: car.id, data: { status: v as never } })
              }
            >
              <SelectTrigger className="h-10 w-36 border-ink/20 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <CarFormDialog car={car} onDone={refresh} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center text-ink-mute hover:text-destructive"
                  aria-label={`Delete ${carTitle(car)}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-sand">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-xl font-normal">
                    Remove {carTitle(car)}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This deletes the listing permanently. If it was sold, mark it “Sold”
                    instead — sold cars build your track record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="min-h-[44px]">Keep it</AlertDialogCancel>
                  <AlertDialogAction
                    className="min-h-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => remove.mutate({ id: car.id })}
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
