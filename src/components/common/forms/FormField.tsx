"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  /** Field label, shown above the input. */
  label: string;
  /** ID of the wrapped input/textarea (`for` attribute on the label). */
  htmlFor?: string;
  /** Show a "*" after the label. */
  required?: boolean;
  /** Validation message — rendered below the field. */
  error?: string;
  /** Optional helper text — rendered below the field when there is no error. */
  helper?: string;
  /** Extra class on the wrapping container (defaults to `space-y-2`). */
  className?: string;
  /** The input / textarea / select element. */
  children: ReactNode;
}

/**
 * Form field wrapper — label + input slot + optional error or helper text.
 *
 * Standardises the label styling (uppercase tracking) used across all forms
 * (wiki, ecosystem project/publicgoods, user, profile). Bring your own input
 * component as `children`.
 */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  helper,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-xs text-text-secondary font-semibold uppercase tracking-wider"
      >
        {label}
        {required && <span className="text-brand ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-400">{error}</p>
      ) : helper ? (
        <p className="text-xs text-text-tertiary">{helper}</p>
      ) : null}
    </div>
  );
}
