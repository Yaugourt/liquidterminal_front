"use client";

import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const MAX_WIDTH_CLASS: Record<MaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};

interface FormModalProps {
  /** Controlled open state. */
  open: boolean;
  /** Open-state setter (closes the dialog when called with `false`). */
  onOpenChange: (open: boolean) => void;
  /** Dialog title (shown in the header, also wired to `aria-labelledby`). */
  title: string;
  /** Optional one-line description below the title. */
  description?: string;
  /** Hide the title visually but keep it for screen readers. Defaults to `false`. */
  hideTitle?: boolean;
  /** Max-width preset for the modal body. Defaults to `md`. */
  maxWidth?: MaxWidth;
  /** Extra class on the `DialogContent`. */
  className?: string;
  /** Modal content — typically a `<form>` with `<FormSection>` and `<FormFooter>`, or `<Tabs>`. */
  children: ReactNode;
}

/**
 * Standardised wrapper around the shadcn `<Dialog>` primitive for forms.
 *
 * Renders a styled `DialogContent` with a consistent header (title +
 * optional description). The footer is NOT included — compose with
 * `<FormFooter>` inside `children` (or render your own footer for non-form
 * dialogs).
 *
 * For tabbed modals, render `<Tabs>` inside `children` and let it manage
 * its own state — this keeps the API minimal and tab-shape agnostic.
 *
 * Used by: ProjectModal, ProjectFormModal, UserEditModal, EducationModal,
 * CreateListModal, ImportWalletsCSVDialog, PublicWalletListPreviewDialog.
 */
export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  hideTitle = false,
  maxWidth = "md",
  className,
  children,
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          MAX_WIDTH_CLASS[maxWidth],
          "bg-brand-secondary border border-border-hover rounded-2xl shadow-xl shadow-black/20 text-white",
          className
        )}
      >
        <DialogHeader className={hideTitle ? "sr-only" : undefined}>
          <DialogTitle className={hideTitle ? "sr-only" : "text-lg font-semibold text-white"}>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-text-secondary">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
