"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Hypurr } from "@/components/hypurr/Hypurr";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
    /** Si true, enveloppe le contenu dans une Card */
    withCard?: boolean;
}

export function EmptyState({
    title = "No data available",
    description = "There is no data to display at this time.",
    icon,
    action,
    className,
    withCard = true,
}: EmptyStateProps) {
    const content = (
        <div className={cn(
            "flex flex-col items-center justify-center text-center px-4 py-8 w-full h-[300px]",
            className
        )}>
            {icon ? (
                <div className="w-16 h-16 mb-4 bg-surface-2 rounded-lg flex items-center justify-center">
                    {icon}
                </div>
            ) : (
                <Hypurr mood="shrug" height={84} className="mb-4" />
            )}
            <p className="text-text-primary text-lg mb-2">{title}</p>
            <p className="text-text-tertiary text-sm mb-4">{description}</p>
            {action}
        </div>
    );

    if (withCard) {
        return <Card className="w-full">{content}</Card>;
    }

    return content;
}
