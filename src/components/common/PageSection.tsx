import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  /** Titre de section optionnel. */
  title?: ReactNode;
  /** Slot aligné à droite du titre de section. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * `<PageSection>` — bloc de section d'une page V4. `w-full`, espacement
 * vertical standard, aucune largeur fixe.
 */
export function PageSection({ title, actions, children, className }: PageSectionProps) {
  return (
    <section className={cn("w-full space-y-4", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
