"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TermsContent } from "./terms-content";

export function TermsDialog() {
  const t = useTranslations("auth");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        // The trigger lives inside the checkbox label: stop the click from
        // toggling the checkbox when opening the terms.
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
        className="font-semibold text-primary underline underline-offset-2"
      >
        {t("termsTitle")}
      </button>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t("termsTitle")}</DialogTitle>
          <DialogDescription>{t("termsVersion")}</DialogDescription>
        </DialogHeader>
        <div className="-mx-1 overflow-y-auto px-1 py-1">
          <TermsContent />
        </div>
        <DialogFooter className="shrink-0 pt-2">
          <Button asChild variant="outline">
            <Link href="/terms-and-conditions">{t("openFullPage")}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
