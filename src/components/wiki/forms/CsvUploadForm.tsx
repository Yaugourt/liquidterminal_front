"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useCsvUpload } from "@/services/wiki";
import { InlineSpinner } from "@/components/ui/inline-spinner";

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
                <label htmlFor="csvFile" className="text-xs text-text-secondary font-semibold uppercase tracking-wider">CSV File *</label>
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
                        className="w-full bg-base border-border-subtle text-text-primary hover:bg-surface-2 border-dashed border-2 py-8 rounded-lg"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6 text-brand" />
                            <span className="text-sm">Click to select CSV file</span>
                            <span className="text-xs text-text-tertiary">Max 10MB</span>
                        </div>
                    </Button>
                </div>
            </div>

            {loading && (
                <div className="flex items-center gap-2 text-brand">
                    <InlineSpinner className="text-brand" />
                    <span className="text-sm">Upload en cours...</span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-danger bg-danger/10 border border-danger/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Erreur : {error}</span>
                </div>
            )}

            {result?.success && (
                <div className="space-y-4 bg-success/10 border border-success/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="w-5 h-5" />
                        <h3 className="font-medium">Import réussi !</h3>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Total :</span>
                            <span className="text-brand">{result.data.totalRows}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Succès :</span>
                            <span className="text-success">{result.data.successfulImports}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Échecs :</span>
                            <span className="text-danger">{result.data.failedImports}</span>
                        </div>
                    </div>

                    {result.data.createdCategories.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-brand">Nouvelles catégories créées :</h4>
                            <div className="flex flex-wrap gap-1">
                                {result.data.createdCategories.map((category, index) => (
                                    <span key={index} className="bg-base px-2 py-1 rounded-lg text-xs border border-border-subtle">
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.data.errors.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gold">Erreurs rencontrées :</h4>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {result.data.errors.map((error, index) => (
                                    <div key={index} className="text-xs text-gold bg-gold/10 p-2 rounded-lg">
                                        <div className="font-medium">Ligne {error.row} :</div>
                                        <div>{error.error}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                        <Button
                            onClick={handleSuccess}
                            className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold rounded-lg"
                        >
                            Fermer
                        </Button>
                    </div>
                </div>
            )}

            {!result?.success && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="border-border-subtle text-text-secondary hover:bg-surface-2 rounded-lg"
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
}
