import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Titre de page (h1). */
  title: ReactNode;
  /** Sous-titre descriptif sous le titre. */
  description?: ReactNode;
  /** Slot aligné à droite du titre (boutons, sélecteurs). */
  actions?: ReactNode;
  /** Contenu sous l'en-tête (recherche, filtres en ligne). */
  children?: ReactNode;
  /** Fil d'Ariane optionnel au-dessus du titre. */
  breadcrumb?: ReactNode;
  className?: string;
}

/**
 * `<PageHeader>` — en-tête de page standard V4. `w-full`, responsive,
 * aucune largeur fixe. Source unique du bloc titre+description copié-collé.
 */
export function PageHeader({
  title,
  description,
  actions,
  children,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      {breadcrumb}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5 min-w-0">
          <h1 className="font-inter text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-text-secondary max-w-2xl">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 sm:shrink-0">{actions}</div>
        )}
      </div>
      {children}
    </div>
  );
}
