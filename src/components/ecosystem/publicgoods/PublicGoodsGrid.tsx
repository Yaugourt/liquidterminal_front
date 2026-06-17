"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { SkeletonGrid } from "@/components/common";

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
            <SkeletonGrid
                count={6}
                columns="grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                gap="gap-6"
                lines={3}
            />
        );
    }

    if (items.length === 0) {
        return (
            <Card className="p-8">
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-brand/10 rounded-2xl flex items-center justify-center">
                        {emptyState.icon || <Plus className="w-8 h-8 text-brand" />}
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{emptyState.title}</h3>
                    <p className="text-text-secondary mb-4">{emptyState.description}</p>

                    {emptyState.actionLabel && emptyState.onAction && (
                        <Button
                            onClick={emptyState.onAction}
                            className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold rounded-lg"
                        >
                            {emptyState.actionLabel}
                        </Button>
                    )}
                </div>
            </Card>
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
