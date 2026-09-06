"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CheckCircle2, Clock, Loader2, ShieldCheck, Upload } from "lucide-react";

import type { ApiResponse } from "@/@types";
import { Button } from "@/components/ui/button";import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/auth-client";
import { fetcher } from "@/lib/fetcher";
import { kycSubmitSchema, type KycSubmitValues } from "@/lib/validations/kyc";

type KycDocument = {
  id: string;
  type: string;
  url: string;
  mimeType: string;
  size: number;
};

type KycMe = {
  id: string;
  nationalId: string | null;
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  kycRejectionReason: string | null;
  kycSubmittedAt: string | null;
  kycReviewedAt: string | null;
  kycDocuments: KycDocument[];
};

const KYC_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
];

function DocumentPreview({ document }: { document: KycDocument }) {
  const isImage = document.mimeType.startsWith("image/");
  const isPdf = document.mimeType === "application/pdf";
  if (isImage) {
    return (
      <img
        src={document.url}
        alt="ID document"
        className="max-h-96 w-full rounded-md border object-contain"
      />
    );
  }
  if (isPdf) {
    return (
      <iframe
        src={document.url}
        title="ID document"
        className="h-96 w-full rounded-md border"
      />
    );
  }
  return (
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-primary underline"
    >
      View uploaded document
    </a>
  );
}

function UploadForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<KycSubmitValues>({
    resolver: zodResolver(kycSubmitSchema),
    defaultValues: { document: [] },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: KycSubmitValues) => {
      const formData = new FormData();
      formData.append("ID_DOCUMENT", values.document[0]);
      const response = await fetch("/api/kyc", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Failed to submit documents");
      }
      return response.json() as Promise<ApiResponse<unknown>>;
    },
    onSuccess: async () => {
      toast.success("ID document submitted for review");
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["kyc-me"] });
      onSuccess();
      await getSession({ query: { disableCookieCache: true } });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to submit documents");
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => submitMutation.mutate(values))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID document</FormLabel>
              <FormControl>
                <ImageDropzone
                  value={field.value ?? []}
                  onChange={field.onChange}
                  maxFiles={1}
                  accept={KYC_ACCEPT}
                  maxSize={5 * 1024 * 1024}
                  description="JPG, PNG, WebP, AVIF or PDF. Max 1 file, 5 MB."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP, AVIF or PDF. Max 5 MB.
        </p>
        <Button type="submit" disabled={submitMutation.isPending}>
          {submitMutation.isPending && <Loader2 className="animate-spin" />}
          <Upload />
          {submitMutation.isPending ? "Submitting..." : "Submit for review"}
        </Button>
      </form>
    </Form>
  );
}

export default function KycPage() {
  const [resubmitting, setResubmitting] = useState(false);

  const kycQuery = useQuery<ApiResponse<KycMe>>({
    queryKey: ["kyc-me"],
    queryFn: () => fetcher("/kyc/me"),
  });

  const kyc = kycQuery.data?.data;
  const status = kyc?.kycStatus ?? "NOT_SUBMITTED";
  const document = kyc?.kycDocuments?.[0];

  if (kycQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ShieldCheck className="size-6" />
          Verification
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verify your identity to start listing properties.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>National ID</CardTitle>
          <CardDescription>
            This is the ID our team will check against your document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input value={kyc?.nationalId ?? "—"} readOnly disabled />
        </CardContent>
      </Card>

      {status === "NOT_SUBMITTED" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload your ID document</CardTitle>
            <CardDescription>
              Upload a clear photo or scan of your national ID for review 
              before you can create, edit or delete properties.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm onSuccess={() => setResubmitting(false)} />
          </CardContent>
        </Card>
      )}

      {status === "PENDING" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-amber-500" />
              Under review
            </CardTitle>
            <CardDescription>
              Your document was submitted and is waiting for admin approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {document && <DocumentPreview document={document} />}
          </CardContent>
        </Card>
      )}

      {status === "REJECTED" && (
        <>
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Verification rejected</CardTitle>
              <CardDescription className="text-destructive/90">
                {kyc?.kycRejectionReason ?? "Your document was rejected."}
              </CardDescription>
            </CardHeader>
            {document && (
              <CardContent>
                <DocumentPreview document={document} />
              </CardContent>
            )}
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Re-upload your ID document</CardTitle>
              <CardDescription>
                Address the reason above and submit a new document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadForm onSuccess={() => setResubmitting(!resubmitting)} />
            </CardContent>
          </Card>
        </>
      )}

      {status === "APPROVED" && (
        <Card className="border-green-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="size-5" />
              Verification approved
            </CardTitle>
            <CardDescription>
              You can now create, edit and delete properties.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/properties/new">Add your first property</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
