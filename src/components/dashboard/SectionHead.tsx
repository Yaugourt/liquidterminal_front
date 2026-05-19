"use client";

import { memo } from "react";
import Link from "next/link";

interface SectionHeadProps {
  /** Titre de section (ex: "Network Pulse"). */
  title: string;
  /** Sous-titre optionnel, en texte tertiaire. */
  subtitle?: string;
  /** Libellé du lien optionnel à droite. */
  linkLabel?: string;
  /** Href du lien optionnel. */
  linkHref?: string;
}

/**
 * SectionHead — en-tête de section du Dashboard.
 * Style maquette analytics (mockup 3) : titre + sous-titre baseline,
 * lien optionnel poussé à droite.
 */
export const SectionHead = memo(function SectionHead({
  title,
  subtitle,
  linkLabel,
  linkHref,
}: SectionHeadProps) {
  return (
    <div className="flex items-baseline gap-3 mb-1">
      <h2 className="text-[14px] font-semibold text-text-primary">{title}</h2>
      {subtitle && (
        <span className="text-[11px] text-text-tertiary">{subtitle}</span>
      )}
      {linkLabel &&
        (linkHref ? (
          <Link
            href={linkHref}
            className="ml-auto text-[11px] text-text-secondary hover:text-brand transition-colors"
          >
            {linkLabel}
          </Link>
        ) : (
          <span className="ml-auto text-[11px] text-text-secondary hover:text-brand transition-colors">
            {linkLabel}
          </span>
        ))}
    </div>
  );
});
