"use client";

import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApiResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import type { Conversation } from "./types";

export function MessageButton({ label, size }: { label?: string; size?: "default" | "sm" }) {
  const t = useTranslations("bookings");
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: () =>
      fetcher<ApiResponse<Conversation>>("/messages/conversations/support", {
        method: "POST",
      }),
    onSuccess: ({ data }) => router.push(`/dashboard/messages?conversation=${data.id}`),
    onError: () => toast.error(t("supportError")),
  });
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className="relative z-10"
      disabled={mutation.isPending}
      onClick={(event) => {
        event.stopPropagation();
        mutation.mutate();
      }}
    >
      <MessageSquare className="size-4" />
      {mutation.isPending ? t("opening") : (label ?? t("messageSupport"))}
    </Button>
  );
}
