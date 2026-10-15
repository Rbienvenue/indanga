"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProviderAgreementContent } from "./provider-agreement-content";

export function ProviderAgreementDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          Provider Agreement
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>INDANGA Provider Agreement</DialogTitle>
          <DialogDescription>
            Commercial and legal drafting template — Rwanda counsel review required before
            onboarding providers.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-1 overflow-y-auto px-1 py-1">
          <ProviderAgreementContent />
        </div>
        <DialogFooter className="shrink-0 pt-2">
          <Button asChild variant="outline">
            <a href="mailto:info@indanga.com?subject=Provider%20Agreement%20enquiry">
              Contact us about this agreement
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
