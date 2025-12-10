"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useCsvUpload } from "@/services/wiki";

interface CsvUploadFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function CsvUploadForm({ onSuccess, onCancel }: CsvUploadFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadFile, result, loading, error, reset } = useCsvUpload();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            alert('Veuillez sélectionner un fichier CSV');
            return;
        }

        await uploadFile(file);
    };

    const handleSuccess = () => {
        if (result?.success) {
            onSuccess();
        }
        reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="csvFile" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">CSV File *</label>
                <div className="relative">
                    <input
                        ref={fileInputRef}
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        disabled={loading}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="w-full bg-brand-dark border-white/5 text-white hover:bg-white/5 border-dashed border-2 py-8 rounded-xl"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6 text-brand-accent" />
                            <span className="text-sm">Click to select CSV file</span>
                            <span className="text-xs text-zinc-500">Max 10MB</span>
                        </div>
                    </Button>
                </div>
            </div>

            {loading && (
                <div className="flex items-center gap-2 text-brand-accent">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-accent"></div>
                    <span className="text-sm">Upload en cours...</span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Erreur : {error}</span>
                </div>
            )}

            {result?.success && (
                <div className="space-y-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                        <h3 className="font-medium">Import réussi !</h3>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Total :</span>
                            <span className="text-brand-accent">{result.data.totalRows}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Succès :</span>
                            <span className="text-emerald-400">{result.data.successfulImports}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Échecs :</span>
                            <span className="text-rose-400">{result.data.failedImports}</span>
                        </div>
                    </div>

                    {result.data.createdCategories.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-brand-accent">Nouvelles catégories créées :</h4>
                            <div className="flex flex-wrap gap-1">
                                {result.data.createdCategories.map((category, index) => (
                                    <span key={index} className="bg-brand-dark px-2 py-1 rounded-lg text-xs border border-white/5">
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.data.errors.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-amber-400">Erreurs rencontrées :</h4>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {result.data.errors.map((error, index) => (
                                    <div key={index} className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded-lg">
                                        <div className="font-medium">Ligne {error.row} :</div>
                                        <div>{error.error}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <Button
                            onClick={handleSuccess}
                            className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
                        >
                            Fermer
                        </Button>
                    </div>
                </div>
            )}

            {!result?.success && (
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="border-white/5 text-zinc-400 hover:bg-white/5 rounded-lg"
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
}
