"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

/**
 * Shared burger button used both by the mobile layout entry point
 * and by the in-sidebar close affordance. Centralised here so size,
 * color and hover state stay consistent across the app.
 */
export function SidebarToggle({
  onClick,
  className,
  label = "Toggle navigation",
}: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "h-9 w-9 text-brand-accent hover:bg-white/5 hover:text-brand-accent",
        className
      )}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
