"use client";

import { useMutation } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApiResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import type { Conversation } from "./types";

export function MessageButton({
  label,
  size,
}: {
  label?: string;
  size?: "default" | "sm";
}) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: () =>
      fetcher<ApiResponse<Conversation>>("/messages/conversations/support", {
        method: "POST",
      }),
    onSuccess: ({ data }) => router.push(`/dashboard/messages?conversation=${data.id}`),
    onError: (error: Error) => toast.error(error.message),
  });
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className="relative z-10"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <MessageSquare className="size-4" />
      {mutation.isPending ? "Opening…" : (label ?? "Message support")}
    </Button>
  );
}
