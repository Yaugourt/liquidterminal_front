import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * V4 surface primitive. Flexible sur le padding et l'interactivité (props),
 * verrouillé sur le look (surface, bordure, radius). Aucune largeur fixe —
 * la Card remplit l'espace que son parent lui donne.
 */
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
  VariantProps<typeof cardVariants>

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ padding, interactive }), className)}
      {...props}
    />
  )
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
  density?: "comfortable" | "compact"
}

const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, density, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ density }), className)}
      {...props}
    />
  )
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

const CardContent = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, density, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ density }), className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, density, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ density }), className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
