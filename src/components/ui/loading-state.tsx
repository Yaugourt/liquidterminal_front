"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Hypurr } from "@/components/hypurr/Hypurr";

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
            {size === "sm" ? (
                <Loader2 className={cn(config.icon, "animate-spin text-brand mb-3")} />
            ) : (
                <div className="mb-3 flex flex-col items-center gap-2">
                    <Hypurr mood="meditation" height={size === "lg" ? 88 : 64} animation="float" />
                    <Loader2 className="h-4 w-4 animate-spin text-brand" />
                </div>
            )}
            <span className={cn("text-text-tertiary", config.text)}>{message}</span>
        </div>
    );

    if (withCard) {
        return <Card className="w-full">{content}</Card>;
    }

    return content;
}
