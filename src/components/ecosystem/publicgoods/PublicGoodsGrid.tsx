"use client";

import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface PublicGoodsGridProps<T> {
    isLoading: boolean;
    items: T[];
    renderItem: (item: T) => ReactNode;
    emptyState: {
        title: string;
        description: string;
        actionLabel?: string;
        onAction?: () => void;
        icon?: ReactNode;
    };
    gridClassName?: string;
}

export function PublicGoodsGrid<T>({
    isLoading,
    items,
    renderItem,
    emptyState,
    gridClassName = "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
}: PublicGoodsGridProps<T>) {

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-6 h-6 text-brand-accent animate-spin mb-2" />
                    <span className="text-zinc-500 text-sm">Loading projects...</span>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="glass-panel p-8">
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-brand-accent/10 rounded-2xl flex items-center justify-center">
                        {emptyState.icon || <Plus className="w-8 h-8 text-brand-accent" />}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{emptyState.title}</h3>
                    <p className="text-zinc-400 mb-4">{emptyState.description}</p>

                    {emptyState.actionLabel && emptyState.onAction && (
                        <Button
                            onClick={emptyState.onAction}
                            className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
                        >
                            {emptyState.actionLabel}
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={gridClassName}>
            {items.map((item, index) => (
                <div key={index}>
                    {renderItem(item)}
                </div>
            ))}
        </div>
    );
}
