"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormFooterProps {
  /** Cancel handler — closes the modal, resets the form, etc. */
  onCancel: () => void;
  /** Submit button label (idle state). Defaults to "Submit". */
  submitLabel?: string;
  /** Submit button label while `isSubmitting` is true. */
  submittingLabel?: string;
  /** Cancel button label. Defaults to "Cancel". */
  cancelLabel?: string;
  /** True while submit is in flight — disables the submit button. */
  isSubmitting?: boolean;
  /** Generic disable flag (e.g. when the form is invalid). */
  disabled?: boolean;
  /** Optional extra slot on the LEFT of the footer (secondary action, tip, etc.). */
  leftSlot?: ReactNode;
  /** Extra class on the wrapping container. */
  className?: string;
}

/**
 * Standard submit/cancel footer for forms.
 *
 * Renders a right-aligned `Cancel` + `Submit` pair separated from the form
 * body by a `border-t`. Submit is a `type="submit"` button (works with the
 * native form submission flow).
 */
export function FormFooter({
  onCancel,
  submitLabel = "Submit",
  submittingLabel = "Submitting...",
  cancelLabel = "Cancel",
  isSubmitting = false,
  disabled = false,
  leftSlot,
  className,
}: FormFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 pt-4 border-t border-border-subtle",
        className
      )}
    >
      <div className="flex-1 min-w-0">{leftSlot}</div>
      <div className="flex gap-3 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-border-subtle text-text-secondary hover:bg-white/5 rounded-lg"
        >
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || disabled}
          className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold rounded-lg"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </div>
  );
}
