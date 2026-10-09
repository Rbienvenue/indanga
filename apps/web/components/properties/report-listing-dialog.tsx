"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { fetcher } from "@/lib/fetcher";

const schema = z.object({
  reason: z.string().trim().min(10, "Describe your concern in at least 10 characters").max(2000),
});
export function ReportListingDialog({ houseId }: { houseId: string }) {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof schema>) =>
      fetcher(`/properties/${houseId}/reports`, { method: "POST", body: JSON.stringify(values) }),
    onSuccess: () => {
      toast.success("Report saved. INDANGA will review your concern.");
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full text-destructive">
          <AlertTriangle className="size-4" />
          Report this listing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this listing</DialogTitle>
        </DialogHeader>
        {!session?.user ? (
          <div className="space-y-3">
            <p>Sign in to submit a report.</p>
            <Button asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            >
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is wrong with this listing?</FormLabel>
                    <FormControl>
                      <Textarea {...field} maxLength={2000} disabled={mutation.isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs text-muted-foreground">
                Do not include passwords, payment credentials or identity document numbers.
              </p>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting…" : "Submit report"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
