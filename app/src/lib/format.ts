export function formatKES(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

export function formatKm(n: number) {
  return `${n.toLocaleString("en-KE")} km`;
}

export function carTitle(c: { make: string; model: string; year: number }) {
  return `${c.make} ${c.model}`;
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const BODY_TYPES = [
  { value: "suv", label: "SUV" },
  { value: "sedan", label: "Sedan" },
  { value: "hatchback", label: "Hatchback" },
  { value: "wagon", label: "Wagon" },
  { value: "pickup", label: "Pickup" },
  { value: "van", label: "Van" },
  { value: "coupe", label: "Coupé" },
] as const;

export function bodyTypeLabel(value: string) {
  return BODY_TYPES.find((b) => b.value === value)?.label ?? value;
}

export const INQUIRY_STATUS = {
  new: { label: "New", tone: "gold" },
  in_progress: { label: "In progress", tone: "blue" },
  replied: { label: "Replied", tone: "green" },
  closed: { label: "Closed", tone: "grey" },
} as const;
