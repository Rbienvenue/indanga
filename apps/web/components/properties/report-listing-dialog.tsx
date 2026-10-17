"use client";
import { useTranslations } from "next-intl";
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
  reason: z
    .string()
    .trim()
    .min(10, "validation.reportMinimum")
    .max(2000, "validation.reportMaximum"),
});
export function ReportListingDialog({ houseId }: { houseId: string }) {
  const t = useTranslations("properties");
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
      toast.success(t("reportSaved"));
      setOpen(false);
      form.reset();
    },
    onError: () => toast.error(t("reportError")),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full text-destructive">
          <AlertTriangle className="size-4" />
          {t("reportListing")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reportListing")}</DialogTitle>
        </DialogHeader>
        {!session?.user ? (
          <div className="space-y-3">
            <p>{t("signInReport")}</p>
            <Button asChild>
              <Link href="/auth/login">{t("signIn")}</Link>
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
                    <FormLabel>{t("reportQuestion")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} maxLength={2000} disabled={mutation.isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs text-muted-foreground">{t("reportPrivacy")}</p>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t("submitting") : t("submitReport")}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
