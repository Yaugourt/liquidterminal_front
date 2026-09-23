"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * V4 surface primitive. Flexible sur le padding et l'interactivité (props),
 * verrouillé sur le look (surface, bordure, radius). Aucune largeur fixe —
 * la Card remplit l'espace que son parent lui donne.
 */

type CardDensity = "comfortable" | "compact"

/**
 * Density chosen once on `<Card density=…>` and inherited by
 * `CardHeader` / `CardContent` / `CardFooter`. `undefined` means the card made
 * no choice, so sections fall back to their historical default (comfortable).
 * A section can still override with its own `density` prop.
 */
const CardDensityContext = React.createContext<CardDensity | undefined>(undefined)

/** explicit prop > inherited card density > historical default. */
function useResolvedDensity(explicit?: CardDensity): CardDensity {
  const inherited = React.useContext(CardDensityContext)
  return explicit ?? inherited ?? "comfortable"
}

const cardVariants = cva(
  "bg-surface border border-border-subtle rounded-lg overflow-hidden transition-all",
  {
    variants: {
      // `none` = défaut historique (le padding venait de CardHeader/Content).
      padding: { none: "", sm: "p-3", md: "p-3.5", lg: "p-6" },
      interactive: { true: "hover:border-border-default", false: "" },
    },
    defaultVariants: { padding: "none", interactive: true },
  }
)

type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants> & {
    /** Density inherited by the card sections. Omit to keep the historical default. */
    density?: CardDensity
  }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, interactive, density, ...props }, ref) => {
    const el = (
      <div
        ref={ref}
        className={cn(cardVariants({ padding, interactive }), className)}
        {...props}
      />
    )
    // Only publish a density context when the card actually opts in, so cards
    // that don't pass `density` leave their sections on the historical default.
    return density ? (
      <CardDensityContext.Provider value={density}>{el}</CardDensityContext.Provider>
    ) : (
      el
    )
  }
)
Card.displayName = "Card"

/** Densité partagée par CardHeader/Content/Footer. `comfortable` = défaut historique (p-6). */
const cardHeaderVariants = cva("flex flex-col space-y-1.5", {
  variants: { density: { comfortable: "p-6", compact: "p-3.5" } },
  defaultVariants: { density: "comfortable" },
})

const cardContentVariants = cva("", {
  variants: { density: { comfortable: "p-6 pt-0", compact: "p-3.5 pt-0" } },
  defaultVariants: { density: "comfortable" },
})

const cardFooterVariants = cva("flex items-center", {
  variants: { density: { comfortable: "p-6 pt-0", compact: "p-3.5 pt-0" } },
  defaultVariants: { density: "comfortable" },
})

type CardSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  density?: CardDensity
}

const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, density, ...props }, ref) => {
    const d = useResolvedDensity(density)
    return (
      <div
        ref={ref}
        className={cn(cardHeaderVariants({ density: d }), className)}
        {...props}
      />
    )
  }
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight font-inter", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

type CardContentProps = CardSectionProps & {
  /**
   * Flush the body's padding so an inner table owns its own margins.
   * Use this semantic mode instead of scattering `p-0` on the page.
   */
  flush?: boolean
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, density, flush, ...props }, ref) => {
    const d = useResolvedDensity(density)
    return (
      <div
        ref={ref}
        className={cn(flush ? "p-0" : cardContentVariants({ density: d }), className)}
        {...props}
      />
    )
  }
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, density, ...props }, ref) => {
    const d = useResolvedDensity(density)
    return (
      <div
        ref={ref}
        className={cn(cardFooterVariants({ density: d }), className)}
        {...props}
      />
    )
  }
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
