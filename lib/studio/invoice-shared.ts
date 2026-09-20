// Invoice types + money formatting that both server and client code can import.
export type InvoiceItem = { description: string; cents: number };
export type InvoiceStatus = "draft" | "sent" | "paid" | "void";
export type StudioInvoice = {
  id: string;
  number: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
  items: InvoiceItem[];
  totalCents: number;
  dueDate: string | null;
  note: string;
  status: InvoiceStatus;
  sentAt: string | null;
  emailedAt: string | null;
  textedAt: string | null;
  paidAt: string | null;
  paidHow: string | null;
  orderId: string | null;
  stripeSessionId: string | null;
};

export const fmtMoney = (cents: number) => (cents % 100 === 0 ? `$${(cents / 100).toLocaleString("en-US")}` : `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

import { calendarDate } from "./time";
export const fmtDate = calendarDate;
