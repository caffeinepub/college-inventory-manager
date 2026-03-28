import { Category } from "../backend.d";

export const CATEGORY_CONFIG = {
  [Category.electrical]: {
    label: "Electrical",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  [Category.plumbing]: {
    label: "Plumbing",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  [Category.carpentry]: {
    label: "Carpentry",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
  },
  [Category.housekeeping]: {
    label: "Housekeeping",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
};

export function getStockStatus(quantity: bigint, threshold: bigint) {
  const q = Number(quantity);
  const t = Number(threshold);
  if (q <= t) return "low";
  if (q <= t * 2) return "medium";
  return "in-stock";
}

export function nsToDate(ns: bigint): Date {
  return new Date(Number(ns) / 1_000_000);
}

export function dateToNs(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}

export function formatDate(ns: bigint): string {
  if (ns === 0n) return "—";
  return nsToDate(ns).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
