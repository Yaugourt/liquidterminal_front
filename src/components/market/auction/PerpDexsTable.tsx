import { memo, useState } from 'react';
import { usePerpDexs } from '@/services/market/auction';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Database, Loader2, Copy, Check } from 'lucide-react';

// EmptyState strictement identique
const EmptyState = memo(() => (
  <TableRow>
    <TableCell colSpan={6} className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg">Aucun DEX perpétuel disponible</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">Vérifiez plus tard</p>
      </div>
    </TableCell>
  </TableRow>
));
EmptyState.displayName = 'EmptyState';

// Format court pour l'adresse
const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

// Mapping temporaire des deployers vers leurs noms (en attendant l'API backend)
const getDeployerName = (address: string): string => {
  const deployerNames: Record<string, string> = {
    '0x88806a71d74ad0a510b350545c9ae490912f0888': 'Unit',
    // Ajouter d'autres mappings ici si nécessaire
  };
  return deployerNames[address.toLowerCase()] || formatAddress(address);
};

// Extraire le fullName depuis assetToStreamingOiCap
const extractFullName = (assetToStreamingOiCap: [string, string][]): string => {
  if (!assetToStreamingOiCap || assetToStreamingOiCap.length === 0) {
    return '-';
  }
  const firstAsset = assetToStreamingOiCap[0][0];
  const parts = firstAsset.split(':');
  return parts.length > 1 ? parts[1] : firstAsset;
};

export const PerpDexsTable = memo(function PerpDexsTable() {
  const { perpDexs, isLoading, error } = usePerpDexs();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Filtrer les valeurs null/undefined
  const validPerpDexs = perpDexs.filter(dex => dex !== null && dex !== undefined);

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 1200);
    } catch {}
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-[#051728E5] border-2 border-[#FF4D4F] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
        <div className="flex justify-center items-center h-[200px]">
          <span className="text-red-500 text-lg">Erreur lors du chargement des DEXs perpétuels</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHead className="pl-4 w-[12%] text-left text-white font-normal py-1 bg-[#051728] text-sm">Name</TableHead>
              <TableHead className="pl-2 w-[15%] text-left text-white font-normal py-1 bg-[#051728] text-sm">Full Name</TableHead>
              <TableHead className="pl-2 w-[15%] text-left text-white font-normal py-1 bg-[#051728] text-sm">Deployer</TableHead>
              <TableHead className="pl-2 w-[15%] text-left text-white font-normal py-1 bg-[#051728] text-sm">Oracle Updater</TableHead>
              <TableHead className="pl-2 w-[18%] text-left text-white font-normal py-1 bg-[#051728] text-sm">Fee Recipient</TableHead>
              <TableHead className="pl-2 pr-4 w-[15%] text-left text-white font-normal py-1 bg-[#051728] text-sm">Gas (HYPE)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {validPerpDexs.length === 0 ? (
              <EmptyState />
            ) : (
              validPerpDexs.map((dex) => (
                <TableRow
                  key={dex.name}
                  className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors cursor-pointer"
                >
                  {/* Name */}
                  <TableCell className="py-2 pl-4 text-white text-sm text-left">
                    {dex.name}
                  </TableCell>

                  {/* Full Name */}
                  <TableCell className="py-2 pl-2 text-white text-sm text-left">
                    {extractFullName(dex.assetToStreamingOiCap)}
                  </TableCell>

                  {/* Deployer */}
                  <TableCell className="py-2 pl-2 text-white text-sm text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#83E9FF] font-inter">{dex.deployerName || getDeployerName(dex.deployer)}</span>
                      <button 
                        onClick={e => { e.preventDefault(); handleCopy(dex.deployer); }} 
                        className="group p-1 rounded transition-colors"
                        title={dex.deployer}
                      >
                        {copiedAddress === dex.deployer ? (
                          <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  {/* Oracle Updater */}
                  <TableCell className="py-2 pl-2 text-white text-sm text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#83E9FF] font-inter">{formatAddress(dex.oracleUpdater)}</span>
                      <button 
                        onClick={e => { e.preventDefault(); handleCopy(dex.oracleUpdater); }} 
                        className="group p-1 rounded transition-colors"
                      >
                        {copiedAddress === dex.oracleUpdater ? (
                          <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  {/* Fee Recipient */}
                  <TableCell className="py-2 pl-2 text-white text-sm text-left">
                    {dex.feeRecipient ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#83E9FF] font-inter">{formatAddress(dex.feeRecipient)}</span>
                        <button 
                          onClick={e => { e.preventDefault(); handleCopy(dex.feeRecipient!); }} 
                          className="group p-1 rounded transition-colors"
                        >
                          {copiedAddress === dex.feeRecipient ? (
                            <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#FFFFFF80] text-xs">-</span>
                    )}
                  </TableCell>

                  {/* Gas (HYPE) */}
                  <TableCell className="py-2 pl-2 pr-4 text-white text-sm text-left">
                    {dex.gas ? (
                      <span className="text-white font-medium">{dex.gas}</span>
                    ) : (
                      <span className="text-[#FFFFFF80] text-xs">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
});

