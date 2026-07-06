"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubmitResource, useEducationalCategories } from "@/services/wiki";
import { toast } from "sonner";
import { AlertCircle, CheckCircle } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { AxiosError } from "axios";
import { showXpGainToast } from "@/components/xp";

interface UserSubmissionFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

// Explicit error messages for the content filter reasons
const getContentFilterMessage = (reason?: string): string => {
    switch (reason) {
        case 'BLACKLISTED_DOMAIN':
            return "This domain is not allowed (e.g. URL shorteners)";
        case 'BLOCKED_EXTENSION':
            return "Direct file downloads are not allowed";
        case 'MALWARE_PATTERN':
            return "This URL contains suspicious patterns";
        case 'INJECTION_DETECTED':
            return "Invalid URL";
        case 'URL_MANIPULATION':
            return "This URL looks manipulated";
        case 'PUNYCODE_DETECTED':
            return "Domains with special characters are not allowed";
        case 'HOMOGRAPH_DETECTED':
            return "Invalid URL: suspicious characters";
        case 'HTTPS_REQUIRED':
            return "Only HTTPS URLs are accepted";
        default:
            return "This URL is not allowed";
    }
};

export function UserSubmissionForm({ onSuccess, onCancel }: UserSubmissionFormProps) {
    const [url, setUrl] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const { submit, isLoading, rateLimitRemaining, isRateLimited } = useSubmitResource();
    const { categories } = useEducationalCategories({ limit: 100 });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.startsWith("https://")) {
            toast.error("URL must start with https://");
            return;
        }

        try {
            await submit({
                url,
                categoryIds: categoryId ? [parseInt(categoryId)] : [],
            });

            toast.success(
                "Resource submitted! It will be reviewed by a moderator.",
                { duration: 5000 }
            );

            // XP reward matches the backend ADD_EDUCATIONAL_RESOURCE constant (25)
            showXpGainToast(25, "+25 XP Resource submitted");

            setUrl("");
            setCategoryId("");
            onSuccess?.();
        } catch (err) {
            const error = err as AxiosError<{ code?: string; reason?: string; error?: string }>;
            const code = error.response?.data?.code;
            const reason = error.response?.data?.reason;

            // Rate limit first (status 429 or explicit code); backend cap is 5/day
            if (error.response?.status === 429 || code === 'RATE_LIMIT_EXCEEDED') {
                toast.error("Daily submission limit reached (5/day). Try again tomorrow.");
                return;
            }

            switch (code) {
                case 'CONTENT_FILTERED':
                    toast.error(getContentFilterMessage(reason));
                    break;
                case 'EDUCATIONAL_RESOURCE_ALREADY_EXISTS':
                    toast.error("This resource has already been submitted");
                    break;
                case 'EDUCATIONAL_INVALID_URL':
                    toast.error("Invalid URL");
                    break;
                default:
                    toast.error(error.response?.data?.error || "Failed to submit resource");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rate limit warning */}
            {isRateLimited && (
                <div className="flex items-center gap-2 p-3 bg-gold/10 border border-gold/20 rounded-lg text-gold text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Daily limit reached (5/day). Try again tomorrow.</span>
                </div>
            )}

            {/* Rate limit info */}
            {rateLimitRemaining !== undefined && !isRateLimited && (
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    <CheckCircle className="w-3 h-3" />
                    <span>{rateLimitRemaining} submission(s) left today</span>
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="resourceUrl" className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                    Resource URL *
                </label>
                <Input
                    id="resourceUrl"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-base border-border-subtle text-text-primary rounded-lg placeholder:text-text-tertiary focus:border-brand/50"
                    placeholder="https://example.com/article"
                    required
                    disabled={isRateLimited || isLoading}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="resourceCategory" className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                    Category (optional)
                </label>
                <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    disabled={isRateLimited || isLoading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories?.map(cat => (
                            <SelectItem
                                key={cat.id}
                                value={String(cat.id)}
                                className="text-text-secondary hover:bg-surface-2 focus:bg-surface-2 rounded-lg"
                            >
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="border-border-subtle text-text-secondary hover:bg-surface-2 rounded-lg"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isLoading || isRateLimited}
                    className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold rounded-lg"
                >
                    {isLoading ? (
                        <>
                            <InlineSpinner className="mr-2" />
                            Submitting...
                        </>
                    ) : (
                        "Submit"
                    )}
                </Button>
            </div>

            <p className="text-xs text-text-tertiary text-center">
                Your submission will be reviewed by a moderator before publication.
            </p>
        </form>
    );
}
