"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

/** Track sizes. `default` is the historical size; `sm` is the dense strip. */
const tabsListVariants = cva(
    "inline-flex items-center justify-center rounded-md bg-surface-2 text-text-secondary",
    {
        variants: { size: { default: "h-10 p-1", sm: "h-auto p-0.5" } },
        defaultVariants: { size: "default" },
    }
)

/**
 * Trigger sizes. The active/focus treatment is centralized here (brand fill,
 * navy text, shared `.focus-ring`) so consumers never re-declare a
 * `data-[state=active]` recipe — they only pick a `size`.
 */
const tabsTriggerVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all motion-reduce:transition-none focus-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-brand data-[state=active]:text-brand-text-on",
    {
        variants: {
            size: {
                default: "rounded-sm px-3 py-1.5 text-sm",
                sm: "rounded px-2.5 py-1 text-[11px]",
            },
        },
        defaultVariants: { size: "default" },
    }
)

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
        VariantProps<typeof tabsListVariants>
>(({ className, size, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(tabsListVariants({ size }), className)}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
        VariantProps<typeof tabsTriggerVariants>
>(({ className, size, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(tabsTriggerVariants({ size }), className)}
        {...props}
    />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 focus-ring",
            className
        )}
        {...props}
    />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }