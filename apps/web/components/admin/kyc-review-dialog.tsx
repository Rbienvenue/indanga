"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Loader2, ShieldCheck } from "lucide-react";

import type { ApiResponse } from "@/@types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "@/lib/auth-client";
import { fetcher } from "@/lib/fetcher";

export type KycDocumentSummary = {
  id: string;
  type: string;
  url: string;
  mimeType: string;
  size: number;
};

export type KycLandlord = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  nationalId: string | null;
  image?: string | null;
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  kycRejectionReason: string | null;
  kycSubmittedAt: string | null;
  kycReviewedAt: string | null;
  kycDocuments: KycDocumentSummary[];
  createdAt: string;
};

type NidaRecord = {
  foreName?: string;
  surnames?: string;
  fatherNames?: string;
  motherNames?: string;
  dateOfBirth?: string;
  sex?: string;
  photo?: string;
  documentNumber?: string;
  id?: string;
  [key: string]: unknown;
};

export function KycReviewDialog({ landlord }: { landlord: KycLandlord }) {
  const [open, setOpen] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const documents = landlord.kycDocuments ?? [];

  const nidaMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams({ id: landlord.nationalId ?? "" });
      return fetcher<ApiResponse<NidaRecord>>(`/kyc/verify/nida?${params}`);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "NIDA lookup failed");
    },
  });

  const downloadDocument = async (doc: KycDocumentSummary) => {
    const extension = doc.url.split(".").pop() ?? "bin";
    const filename = `${landlord.name.replace(/\s+/g, "-")}-${doc.type}.${extension}`;
    try {
      const response = await fetch(doc.url);
      if (!response.ok) throw new Error("Failed to fetch document");
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(doc.url, "_blank", "noopener,noreferrer");
    }
  };

  const refreshSession = async () => {
    await getSession({ query: { disableCookieCache: true } });
    router.refresh();
  };

  const approveMutation = useMutation({
    mutationFn: async () => fetcher(`/kyc/${landlord.id}/approve`, { method: "PATCH" }),
    onSuccess: async () => {
      toast.success("ID verification approved");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-kyc"] });
      await refreshSession();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to approve");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reason: string) =>
      fetcher(`/kyc/${landlord.id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: async () => {
      toast.success("ID verification rejected");
      setOpen(false);
      setShowReject(false);
      setReason("");
      await queryClient.invalidateQueries({ queryKey: ["admin-kyc"] });
      await refreshSession();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to reject");
    },
  });

  const nida = nidaMutation.data?.data;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          setShowReject(false);
          nidaMutation.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Review {landlord.name}  {landlord.email}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Uploaded document</h3>
            {documents.length === 0 && (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            )}
            {documents.map((doc) => (
              <div key={doc.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{doc.type}</Badge>
                  <span className="text-xs text-muted-foreground">{doc.mimeType}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => downloadDocument(doc)}
                  >
                    <Download />
                    Download
                  </Button>
                </div>
                {doc.mimeType.startsWith("image/") ? (
                  <img
                    src={doc.url}
                    alt="ID document"
                    className="max-h-96 w-full rounded-md border object-contain"
                  />
                ) : doc.mimeType === "application/pdf" ? (
                  <iframe
                    src={doc.url}
                    title={doc.type}
                    className="h-96 w-full rounded-md border"
                  />
                ) : (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline"
                  >
                    View document
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">National ID check</h3>
            <div className="flex items-center gap-2">
              <Input value={landlord.nationalId ?? "—"} readOnly disabled />
              <Button
                variant="outline"
                disabled={!landlord.nationalId || nidaMutation.isPending}
                onClick={() => nidaMutation.mutate()}
              >
                {nidaMutation.isPending && <Loader2 className="animate-spin" />}
                Verify with NIDA
              </Button>
            </div>
            {nidaMutation.isPending && (
              <p className="text-sm text-muted-foreground">Looking up NIDA record...</p>
            )}
            {nida && (
              <div className="flex gap-4 rounded-lg border p-4">
                {typeof nida.photo === "string" && nida.photo && (
                  <img
                    src={`data:image/jpeg;base64,${nida.photo}`}
                    alt="NIDA photo"
                    className="size-24 rounded-md border object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {[nida.foreName, nida.surnames].filter(Boolean).join(" ") || "—"}
                  </p>
                  <p className="text-muted-foreground">DOB: {nida.dateOfBirth ?? "—"}</p>
                  <p className="text-muted-foreground">Gender: {nida.sex ?? "—"}</p>
                  <p className="text-muted-foreground">
                    ID: {nida.documentNumber ?? nida.id ?? "—"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {!showReject ? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReject(true)}>
              Reject
            </Button>
            <Button disabled={approveMutation.isPending} onClick={() => approveMutation.mutate()}>
              {approveMutation.isPending && <Loader2 className="animate-spin" />}
              <ShieldCheck />
              Approve
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection reason (min 4 characters)</Label>
              <Input
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Document is not clear, re-upload a clear photo"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReject(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={rejectMutation.isPending || reason.trim().length < 4}
                onClick={() => rejectMutation.mutate(reason.trim())}
              >
                {rejectMutation.isPending && <Loader2 className="animate-spin" />}
                Confirm reject
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
