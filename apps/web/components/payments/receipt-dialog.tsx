"use client";

import { useLocale, useTranslations } from "next-intl";
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
import { formatCurrency } from "@/lib/utils";

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
  cautionFee?: number;
  serviceFee: number;
  total: number;
  amountPaid: number;
  currency: string;
};

export function ReceiptDialog({ paymentId }: { paymentId: string }) {
  const t = useTranslations("payments");
  const locale = useLocale();
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
    } catch {
      toast.error(t("receiptDownloadError"));
    } finally {
      setDownloading(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={(event) => event.stopPropagation()}>
          {t("viewReceipt")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("receiptTitle")}</DialogTitle>
        </DialogHeader>
        {query.isLoading ? (
          <p className="p-8">{t("loadingReceipt")}</p>
        ) : query.isError ? (
          <div className="space-y-3 p-8">
            <p role="alert">{t("receiptError")}</p>
            <Button onClick={() => void query.refetch()}>{t("retry")}</Button>
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
                  {downloading ? t("preparing") : t("downloadPdf")}
                </Button>
                <h2 className="text-xl font-bold tracking-tight">{t("receiptHeading")}</h2>
                <p className="mt-1 break-all text-xs text-slate-500">{receipt.id}</p>
                <p className="mt-2 text-xs font-bold text-emerald-700">{t("paidHeading")}</p>
              </div>
            </header>
            <section className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8">
              <div>
                <p className="text-xs text-slate-500">{t("receivedFrom")}</p>
                <p className="mt-2 font-bold">{receipt.customer.name}</p>
                <p className="break-all text-sm text-slate-500">{receipt.customer.email}</p>
                {receipt.customer.phone ? (
                  <p className="text-sm text-slate-500">{receipt.customer.phone}</p>
                ) : null}
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-slate-500">{t("paymentDetails")}</p>
                <p className="mt-2 text-sm">
                  {t("paidOn", {
                    date: new Date(receipt.issuedAt).toLocaleDateString(locale, {
                      timeZone: "Africa/Kigali",
                    }),
                  })}
                </p>
                <p className="text-sm">
                  {t("methodValue", {
                    method: receipt.method === "CARD" ? t("card") : receipt.method,
                  })}
                </p>
                <p className="mt-1 break-all text-xs text-slate-500">
                  {t("bookingId", { id: receipt.bookingReference })}
                </p>
              </div>
            </section>
            <section className="px-6 pb-8 sm:px-8">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead>
                  <tr className="border-y border-slate-200 text-left text-xs text-slate-500">
                    <th className="w-2/3 py-2 font-normal">{t("descriptionHeading")}</th>
                    <th className="py-2 text-right font-normal">{t("amountHeading")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-4 pr-3">
                      <p className="break-words">{receipt.description}</p>
                      <p className="mt-2 text-xs text-slate-500">{receipt.period}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {t("providerValue", { provider: receipt.provider })}
                      </p>
                      {receipt.rate != null ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {formatCurrency(receipt.rate, receipt.currency, locale)} / {receipt.unit}{" "}
                          × {receipt.duration ?? 1} × {receipt.quantity}
                        </p>
                      ) : null}
                    </td>
                    <td className="py-4 text-right align-top tabular-nums">
                      {formatCurrency(receipt.subtotal, receipt.currency, locale)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <dl className="ml-auto mt-5 max-w-72 space-y-2 text-sm">
                {[
                  [t("subtotal"), receipt.subtotal],
                  [t("serviceFee"), receipt.serviceFee],
                  ...((receipt.cautionFee ?? 0) > 0 ? [[t("cautionFee"), receipt.cautionFee]] : []),
                  [t("total"), receipt.total],
                  [t("amountPaid"), receipt.amountPaid],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className={`flex justify-between gap-3 ${label === t("amountPaid") ? "border-t border-slate-200 pt-3 font-bold" : ""}`}
                  >
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="tabular-nums">
                      {formatCurrency(Number(value), receipt.currency, locale)}
                    </dd>
                  </div>
                ))}
              </dl>
              {["EXPIRED", "CANCELLED", "DECLINED", "REJECTED"].includes(receipt.bookingStatus) ? (
                <p className="mt-7 border-t border-slate-200 pt-4 text-xs text-amber-800">
                  {t("inactiveBooking")}
                </p>
              ) : null}
            </section>
            <footer className="border-t border-slate-200 px-6 py-5 text-center text-xs text-slate-500">
              {t("receiptSupport")}
            </footer>
          </article>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
