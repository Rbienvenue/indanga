"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import localFont from "next/font/local";
import Image from "next/image";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { ApiResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetcher } from "@/lib/fetcher";
import { formatPrice } from "@/lib/utils";

const receiptFont = localFont({
  src: [
    { path: "./fonts/SpaceGrotesk-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/SpaceGrotesk-Bold.ttf", weight: "700", style: "normal" },
  ],
});

type Receipt = {
  id: string;
  bookingReference: string;
  bookingStatus: string;
  issuedAt: string;
  method: string;
  transactionReference: string;
  customer: { name: string; email: string; phone: string | null };
  provider: string;
  description: string;
  period: string;
  rate: number | null;
  duration: number | null;
  quantity: number;
  unit: string;
  subtotal: number;
  serviceFee: number;
  total: number;
  amountPaid: number;
};

export function ReceiptDialog({ paymentId }: { paymentId: string }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const query = useQuery<ApiResponse<Receipt>>({
    queryKey: ["payment-receipt", paymentId],
    queryFn: () => fetcher(`/payments/${paymentId}/receipt`),
    enabled: open,
  });
  const receipt = query.data?.data;
  async function download() {
    setDownloading(true);
    try {
      const blob = await fetcher(`/payments/${paymentId}/receipt.pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${paymentId}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not download receipt");
    } finally {
      setDownloading(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Payment receipt</DialogTitle>
        </DialogHeader>
        {query.isLoading ? (
          <p className="p-8">Loading receipt…</p>
        ) : query.isError ? (
          <div className="space-y-3 p-8">
            <p role="alert">Unable to load receipt.</p>
            <Button onClick={() => void query.refetch()}>Retry</Button>
          </div>
        ) : receipt ? (
          <article className={`${receiptFont.className} bg-white text-slate-900`}>
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-6 py-8 sm:px-8">
              <div>
                <Image
                  src="/logo.png"
                  alt="INDANGA"
                  width={150}
                  height={45}
                  className="h-10 w-auto object-contain"
                />
                <div className="mt-3 text-xs leading-relaxed text-slate-500">
                  INDANGA
                  <br />
                  support@indanga.com
                  <br />
                  +250 788 765 547
                </div>
              </div>
              <div className="min-w-0 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-4"
                  disabled={downloading}
                  onClick={() => void download()}
                >
                  <Download className="size-4" />
                  {downloading ? "Preparing…" : "Download PDF"}
                </Button>
                <h2 className="text-xl font-bold tracking-tight">PAYMENT RECEIPT</h2>
                <p className="mt-1 break-all text-xs text-slate-500">{receipt.id}</p>
                <p className="mt-2 text-xs font-bold text-emerald-700">PAID</p>
              </div>
            </header>
            <section className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8">
              <div>
                <p className="text-xs text-slate-500">RECEIVED FROM</p>
                <p className="mt-2 font-bold">{receipt.customer.name}</p>
                <p className="break-all text-sm text-slate-500">{receipt.customer.email}</p>
                {receipt.customer.phone ? (
                  <p className="text-sm text-slate-500">{receipt.customer.phone}</p>
                ) : null}
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-slate-500">PAYMENT DETAILS</p>
                <p className="mt-2 text-sm">
                  Paid{" "}
                  {new Date(receipt.issuedAt).toLocaleDateString("en-GB", {
                    timeZone: "Africa/Kigali",
                  })}
                </p>
                <p className="text-sm">Method {receipt.method}</p>
                <p className="mt-1 break-all text-xs text-slate-500">
                  Booking {receipt.bookingReference}
                </p>
              </div>
            </section>
            <section className="px-6 pb-8 sm:px-8">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead>
                  <tr className="border-y border-slate-200 text-left text-xs text-slate-500">
                    <th className="w-2/3 py-2 font-normal">DESCRIPTION</th>
                    <th className="py-2 text-right font-normal">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-4 pr-3">
                      <p className="break-words">{receipt.description}</p>
                      <p className="mt-2 text-xs text-slate-500">{receipt.period}</p>
                      <p className="mt-1 text-xs text-slate-500">Provider: {receipt.provider}</p>
                      {receipt.rate != null ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {formatPrice(receipt.rate)} / {receipt.unit} × {receipt.duration ?? 1} ×{" "}
                          {receipt.quantity}
                        </p>
                      ) : null}
                    </td>
                    <td className="py-4 text-right align-top tabular-nums">
                      {formatPrice(receipt.subtotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <dl className="ml-auto mt-5 max-w-72 space-y-2 text-sm">
                {[
                  ["Subtotal", receipt.subtotal],
                  ["Service fee", receipt.serviceFee],
                  ["Total", receipt.total],
                  ["Amount paid", receipt.amountPaid],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className={`flex justify-between gap-3 ${label === "Amount paid" ? "border-t border-slate-200 pt-3 font-bold" : ""}`}
                  >
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="tabular-nums">{formatPrice(Number(value))}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-7 border-t border-slate-200 pt-4 text-xs text-slate-500">
                <p>Booking status: {receipt.bookingStatus.replaceAll("_", " ")}</p>
                <p className="mt-2 break-all">
                  Transaction reference: {receipt.transactionReference}
                </p>
                {["EXPIRED", "CANCELLED", "DECLINED", "REJECTED"].includes(
                  receipt.bookingStatus,
                ) ? (
                  <p className="mt-3 text-amber-800">
                    Payment was received. This booking is not active. Contact support for
                    assistance.
                  </p>
                ) : null}
              </div>
            </section>
            <footer className="border-t border-slate-200 px-6 py-5 text-center text-xs text-slate-500">
              Questions? Contact support@indanga.com and include your booking reference.
            </footer>
          </article>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
