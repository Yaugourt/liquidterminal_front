"use client";

import { useState } from "react";
import { FilePlus2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContributionsPanel } from "./ContributionsPanel";

/**
 * Header entry point for contributions in the fused hub: a button opening
 * the submissions + moderation panel in a dialog (it used to be a tab).
 */
export function ContributionsDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-8 gap-1.5 border-border-default bg-surface-2 px-3 text-xs font-medium text-text-secondary hover:text-text-primary"
      >
        <FilePlus2 className="h-3.5 w-3.5" />
        My contributions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto rounded-2xl border border-border-default bg-surface text-text-primary shadow-xl shadow-black/20">
          <DialogTitle className="text-base font-semibold">My contributions</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">
            Your suggested resources and, for moderators, the review queue.
          </DialogDescription>
          <ContributionsPanel />
        </DialogContent>
      </Dialog>
    </>
  );
}
