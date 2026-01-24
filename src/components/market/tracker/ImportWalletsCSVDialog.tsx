"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, AlertCircle, CheckCircle, X, Download } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";

interface ParsedWallet {
  address: string;
  name?: string;
  isValid: boolean;
  error?: string;
}

interface ImportWalletsCSVDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (wallets: Array<{ address: string; name?: string }>) => Promise<void>;
  walletListName?: string;
}

// Validation Ethereum address format
const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export function ImportWalletsCSVDialog({
  isOpen,
  onOpenChange,
  onImport,
  walletListName,
}: ImportWalletsCSVDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedWallets, setParsedWallets] = useState<ParsedWallet[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setParsedWallets([]);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    onOpenChange(open);
  };

  // Parse CSV file
  const parseCSV = useCallback((file: File) => {
    Papa.parse<{ address?: string; name?: string }>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const wallets: ParsedWallet[] = results.data.map((row) => {
          const address = row.address?.trim() || "";
          const name = row.name?.trim() || undefined;

          if (!address) {
            return {
              address: "",
              name,
              isValid: false,
              error: "Missing address",
            };
          }

          if (!isValidAddress(address)) {
            return {
              address,
              name,
              isValid: false,
              error: "Invalid address format",
            };
          }

          return {
            address,
            name,
            isValid: true,
          };
        });

        // Remove duplicates based on address
        const uniqueWallets = wallets.filter(
          (wallet, index, self) =>
            index === self.findIndex((w) => w.address.toLowerCase() === wallet.address.toLowerCase())
        );

        setParsedWallets(uniqueWallets);

        const validCount = uniqueWallets.filter((w) => w.isValid).length;
        const invalidCount = uniqueWallets.length - validCount;

        if (validCount === 0) {
          toast.error("No valid wallets found in CSV");
        } else {
          toast.success(`Parsed ${validCount} valid wallet${validCount !== 1 ? "s" : ""}${invalidCount > 0 ? ` (${invalidCount} invalid)` : ""}`);
        }
      },
      error: () => {
        toast.error("Failed to parse CSV file");
      },
    });
  }, []);

  // Handle file drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === "text/csv") {
        parseCSV(file);
      } else {
        toast.error("Please upload a CSV file");
      }
    },
    [parseCSV]
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        parseCSV(file);
      }
    },
    [parseCSV]
  );

  // Handle import
  const handleImport = async () => {
    const validWallets = parsedWallets
      .filter((w) => w.isValid)
      .map((w) => ({ address: w.address, name: w.name }));

    if (validWallets.length === 0) {
      toast.error("No valid wallets to import");
      return;
    }

    setIsImporting(true);
    try {
      await onImport(validWallets);
      handleOpenChange(false);
    } catch {
      // Error handled by onImport
    } finally {
      setIsImporting(false);
    }
  };

  // Download sample CSV
  const handleDownloadSample = () => {
    const sampleCSV = `address,name
0x1234567890123456789012345678901234567890,My Main Wallet
0xabcdefabcdefabcdefabcdefabcdefabcdefabcd,Trading Wallet
0x9876543210987654321098765432109876543210,`;

    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wallet_import_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedWallets.filter((w) => w.isValid).length;
  const invalidCount = parsedWallets.length - validCount;
  const hasWallets = parsedWallets.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Import Wallets from CSV</DialogTitle>
          <DialogDescription className="text-white">
            {walletListName
              ? `Bulk import wallets to "${walletListName}" using a CSV file`
              : "Bulk import wallets using a CSV file"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Upload Area */}
          {!hasWallets && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                ? "border-brand-accent bg-[#83E9FF10]"
                : "border-border-hover hover:border-white/20 hover:bg-white/5"
                }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-brand-accent" />
              <p className="text-white mb-2">Drag & drop your CSV file here</p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-border-hover text-white hover:bg-white/5"
              >
                <FileText className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Preview Area */}
          {hasWallets && (
            <div className="space-y-3">
              {/* Stats */}
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">
                      {validCount} valid
                    </span>
                  </div>
                  {invalidCount > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-white">
                        {invalidCount} invalid
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setParsedWallets([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>

              {/* Wallet List */}
              <div className="max-h-[300px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {parsedWallets.map((wallet, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${wallet.isValid
                      ? "bg-zinc-800/50 border-border-hover"
                      : "bg-red-950/20 border-red-900/30"
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      {wallet.isValid ? (
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-mono truncate">
                          {wallet.address || "(empty)"}
                        </p>
                        {wallet.name && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {wallet.name}
                          </p>
                        )}
                        {wallet.error && (
                          <p className="text-xs text-red-400 mt-0.5">
                            {wallet.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="flex items-start gap-2 p-3 bg-black/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">
                CSV must have <span className="text-white font-medium">address</span> column (required) and optional <span className="text-white font-medium">name</span> column.
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={handleDownloadSample}
                className="text-brand-accent hover:text-brand-accent p-0 h-auto mt-1"
              >
                <Download className="w-3 h-3 mr-1" />
                Download sample CSV
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-border-hover text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={isImporting || validCount === 0}
            className="bg-[#F9E370E5] text-black hover:bg-[#F0D04E]/90 disabled:opacity-50"
          >
            {isImporting
              ? "Importing..."
              : `Import ${validCount} wallet${validCount !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

