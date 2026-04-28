import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPriceUSD(amount: number | string | null | undefined): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  if (!Number.isFinite(value)) return "$0.00";
  return usdFormatter.format(value);
}
