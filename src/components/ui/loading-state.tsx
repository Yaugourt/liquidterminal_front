"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface LoadingStateProps {
    message?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    /** Si true, enveloppe le contenu dans une Card */
    withCard?: boolean;
}

const sizeConfig = {
    sm: { icon: "h-6 w-6", text: "text-xs", height: "h-[150px]" },
    md: { icon: "h-8 w-8", text: "text-sm", height: "h-[200px]" },
    lg: { icon: "h-10 w-10", text: "text-base", height: "h-[300px]" },
};

export function LoadingState({
    message = "Loading...",
    size = "md",
    className,
    withCard = true,
}: LoadingStateProps) {
    const config = sizeConfig[size];

    const content = (
        <div className={cn(
            "flex flex-col items-center justify-center w-full",
            config.height,
            className
        )}>
            <Loader2 className={cn(config.icon, "animate-spin text-brand-accent mb-3")} />
            <span className={cn("text-text-muted", config.text)}>{message}</span>
        </div>
    );

    if (withCard) {
        return <Card className="w-full">{content}</Card>;
    }

    return content;
}
