"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { ProjectCsvUploadApiResponse } from "@/services/ecosystem/project/types";

interface CsvUploadProps {
  uploadingCsv: boolean;
  csvError: string | null;
  result: ProjectCsvUploadApiResponse | null;
  handleCsvFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleCsvSuccess: () => void;
  resetCsv: () => void;
}

export function CsvUpload({
  uploadingCsv,
  csvError,
  result,
  handleCsvFileSelect,
  handleCsvSuccess,
  resetCsv
}: CsvUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvSuccessInternal = () => {
    handleCsvSuccess();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetCsvInternal = () => {
    resetCsv();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center">
        <div className="border-2 border-dashed border-[#1E3851] rounded-lg p-8 hover:border-brand-accent/50 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-brand-accent mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Upload Projects CSV</h3>
          <p className="text-sm text-gray-400 mb-4">
            Select a CSV file containing project data to bulk import
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingCsv}
            className="bg-brand-accent hover:bg-brand-accent/90 text-black"
          >
            {uploadingCsv ? "Uploading..." : "Choose CSV File"}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {uploadingCsv && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent mx-auto mb-2"></div>
          <p className="text-sm text-gray-400">Processing CSV file...</p>
        </div>
      )}

      {/* Error state */}
      {csvError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <h4 className="text-sm font-medium text-red-400">Upload Failed</h4>
          </div>
          <p className="text-sm text-red-300">{csvError}</p>
          <Button
            type="button"
            variant="outline"
            onClick={resetCsvInternal}
            className="mt-3 border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Success state */}
      {result?.success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <h4 className="text-sm font-medium text-green-400">Upload Successful</h4>
          </div>
          
          <div className="text-sm text-gray-300 space-y-1 mb-3">
            <p>Total rows: {result.data.totalRows}</p>
            <p>Successful imports: {result.data.successfulImports}</p>
            <p>Failed imports: {result.data.failedImports}</p>
            {result.data.createdCategories.length > 0 && (
              <p>Created categories: {result.data.createdCategories.join(', ')}</p>
            )}
          </div>

          {result.data.errors.length > 0 && (
            <div className="mt-3">
              <h5 className="text-sm font-medium text-yellow-400 mb-2">Errors:</h5>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {result.data.errors.map((error, index) => (
                  <p key={index} className="text-xs text-yellow-300">
                    Row {error.row}: {error.error}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              onClick={handleCsvSuccessInternal}
              className="bg-brand-accent hover:bg-brand-accent/90 text-black"
            >
              Done
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetCsvInternal}
              className="border-[#1E3851] text-white hover:bg-[#112941]"
            >
              Upload Another
            </Button>
          </div>
        </div>
      )}

      {/* CSV Format Info */}
      <div className="bg-[#112941]/50 border border-[#1E3851] rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-2">CSV Format</h4>
        <p className="text-xs text-gray-400 mb-2">
          Your CSV file should contain the following columns:
        </p>
        <div className="text-xs text-gray-300 space-y-1">
          <p><strong>title</strong> (required) - Project title</p>
          <p><strong>desc</strong> (required) - Project description</p>
          <p><strong>logo</strong> (required) - Logo URL</p>
          <p><strong>category</strong> (optional) - Category name</p>
          <p><strong>twitter</strong> (optional) - Twitter URL</p>
          <p><strong>discord</strong> (optional) - Discord URL</p>
          <p><strong>telegram</strong> (optional) - Telegram URL</p>
          <p><strong>website</strong> (optional) - Website URL</p>
        </div>
      </div>
    </div>
  );
}
