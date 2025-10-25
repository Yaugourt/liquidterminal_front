/**
 * Utility functions for CSV import/export
 */

/**
 * Generate CSV content from wallets array
 */
export const generateWalletsCSV = (
  wallets: Array<{ address: string; name?: string | null }>
): string => {
  // CSV header
  const header = "address,name";
  
  // CSV rows
  const rows = wallets.map(wallet => {
    const address = wallet.address || "";
    const name = wallet.name || "";
    
    // Escape commas and quotes in name if needed
    const escapedName = name.includes(',') || name.includes('"')
      ? `"${name.replace(/"/g, '""')}"` 
      : name;
    
    return `${address},${escapedName}`;
  });
  
  return [header, ...rows].join("\n");
};

/**
 * Download CSV file
 */
export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export wallets to CSV and download
 */
export const exportWalletsToCSV = (
  wallets: Array<{ address: string; name?: string | null }>,
  filename: string = "wallets_export.csv"
): void => {
  if (wallets.length === 0) {
    throw new Error("No wallets to export");
  }
  
  const csvContent = generateWalletsCSV(wallets);
  downloadCSV(csvContent, filename);
};

