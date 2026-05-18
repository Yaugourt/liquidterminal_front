"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  /** Optional section title (rendered as `<h3>` with section-header styling). */
  title?: string;
  /** Optional one-line description below the title. */
  description?: string;
  /** Section content (typically a stack of `<FormField>`s). */
  children: ReactNode;
  /** Extra class on the wrapping container (defaults to `space-y-4`). */
  className?: string;
}

/**
 * Container for a logical group of form fields. Provides consistent vertical
 * rhythm (`space-y-4`) and an optional section header.
 *
 * Use multiple `<FormSection>`s inside a single form to group related fields
 * (e.g. "General", "Links", "Visibility").
 */
export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-text-tertiary">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
