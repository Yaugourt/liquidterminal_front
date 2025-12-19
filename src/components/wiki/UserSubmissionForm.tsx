"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubmitResource, useEducationalCategories } from "@/services/wiki";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { showXpGainToast } from "@/components/xp";

interface UserSubmissionFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

// Messages d'erreur explicites pour le filtrage de contenu
const getContentFilterMessage = (reason?: string): string => {
    switch (reason) {
        case 'BLACKLISTED_DOMAIN':
            return "Ce domaine n'est pas autorisé (ex: raccourcisseur d'URL)";
        case 'BLOCKED_EXTENSION':
            return "Les téléchargements directs ne sont pas autorisés";
        case 'MALWARE_PATTERN':
            return "Cette URL contient des éléments suspects";
        case 'INJECTION_DETECTED':
            return "URL invalide";
        case 'URL_MANIPULATION':
            return "Cette URL semble manipulée";
        case 'PUNYCODE_DETECTED':
            return "Domaine avec caractères spéciaux non autorisé";
        case 'HOMOGRAPH_DETECTED':
            return "URL invalide - caractères suspects";
        case 'HTTPS_REQUIRED':
            return "Seules les URLs HTTPS sont acceptées";
        default:
            return "Cette URL n'est pas autorisée";
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
            toast.error("L'URL doit commencer par https://");
            return;
        }

        try {
            await submit({
                url,
                categoryIds: categoryId ? [parseInt(categoryId)] : [],
            });

            toast.success(
                "Ressource soumise avec succès ! Elle sera examinée par un modérateur.",
                { duration: 5000 }
            );

            // Show XP gain toast
            showXpGainToast(15, "+15 XP Resource submitted");

            setUrl("");
            setCategoryId("");
            onSuccess?.();
        } catch (err) {
            const error = err as AxiosError<{ code?: string; reason?: string; error?: string }>;
            // Gestion prioritaire du Rate Limit (Status 429 ou Code spécifique)
            if (error.response?.status === 429 || code === 'RATE_LIMIT_EXCEEDED') {
                toast.error("Limite hebdomadaire atteinte (10/semaine).");
                return;
            }

            switch (code) {
                case 'CONTENT_FILTERED':
                    toast.error(getContentFilterMessage(reason));
                    break;
                case 'EDUCATIONAL_RESOURCE_ALREADY_EXISTS':
                    toast.error("Cette ressource a déjà été soumise");
                    break;
                case 'EDUCATIONAL_INVALID_URL':
                    toast.error("URL invalide");
                    break;
                default:
                    toast.error(error.response?.data?.error || "Erreur lors de la soumission");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rate limit warning */}
            {isRateLimited && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Limite quotidienne atteinte (5/jour). Réessayez demain.</span>
                </div>
            )}

            {/* Rate limit info */}
            {rateLimitRemaining !== undefined && !isRateLimited && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <CheckCircle className="w-3 h-3" />
                    <span>{rateLimitRemaining} soumission(s) restante(s) aujourd&apos;hui</span>
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="resourceUrl" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                    URL de la ressource *
                </label>
                <Input
                    id="resourceUrl"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-brand-dark border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-brand-accent/50"
                    placeholder="https://example.com/article"
                    required
                    disabled={isRateLimited || isLoading}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="resourceCategory" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                    Catégorie (optionnel)
                </label>
                <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    disabled={isRateLimited || isLoading}
                >
                    <SelectTrigger className="bg-brand-dark border-white/5 text-white rounded-lg">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-secondary border-white/10 rounded-xl">
                        {categories?.map(cat => (
                            <SelectItem
                                key={cat.id}
                                value={String(cat.id)}
                                className="text-zinc-300 hover:bg-white/5 focus:bg-white/5 rounded-lg"
                            >
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="border-white/5 text-zinc-400 hover:bg-white/5 rounded-lg"
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isLoading || isRateLimited}
                    className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Envoi...
                        </>
                    ) : (
                        "Soumettre"
                    )}
                </Button>
            </div>

            <p className="text-xs text-zinc-500 text-center">
                Votre soumission sera examinée par un modérateur avant publication.
            </p>
        </form>
    );
}
