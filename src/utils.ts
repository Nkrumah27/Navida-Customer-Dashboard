import type { Customer } from "./types";

export function uid(): string {
  return "c_" + Math.random().toString(36).slice(2, 10);
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
}

export function money(n: number): string {
  const value = Number(n) || 0;
  return (
    "GH₵ " +
    value.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function fmtDate(d: string): string {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function purposeLabel(c: Customer): string {
  return c.purpose === "Other" && c.purposeOther ? c.purposeOther : c.purpose;
}

export function totalPaid(c: Customer): number {
  return c.payments.reduce((s, p) => s + p.amount, 0);
}

export function totalBalance(c: Customer): number {
  const total = c.totalAmount - totalPaid(c);
  return Math.max(0, Math.round(total * 100) / 100);
}
