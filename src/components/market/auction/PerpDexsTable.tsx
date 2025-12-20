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
        <Database className="w-10 h-10 mb-4 text-white/20" />
        <p className="text-white text-lg">Aucun DEX perpétuel disponible</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">Vérifiez plus tard</p>
      </div>
    </TableCell>
  </TableRow>
));
EmptyState.displayName = 'EmptyState';

// Format court pour l'adresse
const formatAddress = (address?: string | null) => {
  if (!address || typeof address !== 'string') return '-';
  const start = address.slice(0, 6);
  const end = address.slice(-4);
  return `${start}...${end}`;
};

// Mapping temporaire des deployers vers leurs noms (en attendant l'API backend)
const getDeployerName = (address?: string | null): string => {
  if (!address || typeof address !== 'string') return '-';
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
    } catch { }
  };

  if (isLoading) {
    return (
      <Card className="w-full glass-panel overflow-hidden">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full glass-panel overflow-hidden">
        <div className="flex justify-center items-center h-[200px]">
          <span className="text-red-500 text-lg">Erreur lors du chargement des DEXs perpétuels</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full glass-panel overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent bg-transparent">
              <TableHead className="pl-4 w-[12%] text-left py-3"><span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Name</span></TableHead>
              <TableHead className="pl-2 w-[15%] text-left py-3"><span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Full Name</span></TableHead>
              <TableHead className="pl-2 w-[15%] text-left py-3"><span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Deployer</span></TableHead>
              <TableHead className="pl-2 w-[15%] text-left py-3"><span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Oracle Updater</span></TableHead>
              <TableHead className="pl-2 w-[18%] text-left py-3"><span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Fee Recipient</span></TableHead>
              <TableHead className="pl-2 pr-4 w-[15%] text-left py-3"><span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Gas (HYPE)</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-transparent">
            {validPerpDexs.length === 0 ? (
              <EmptyState />
            ) : (
              validPerpDexs.map((dex) => (
                <TableRow
                  key={dex.name}
                  className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors cursor-pointer"
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
                      <span className="text-brand-accent font-inter">{dex.deployerName || getDeployerName(dex.deployer)}</span>
                      <button
                        onClick={e => { e.preventDefault(); handleCopy(dex.deployer); }}
                        className="group p-1 rounded transition-colors"
                        title={dex.deployer}
                      >
                        {copiedAddress === dex.deployer ? (
                          <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  {/* Oracle Updater */}
                  <TableCell className="py-2 pl-2 text-white text-sm text-left">
                    {dex.oracleUpdater ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-brand-accent font-inter">{formatAddress(dex.oracleUpdater)}</span>
                        <button
                          onClick={e => { e.preventDefault(); handleCopy(dex.oracleUpdater!); }}
                          className="group p-1 rounded transition-colors"
                        >
                          {copiedAddress === dex.oracleUpdater ? (
                            <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#FFFFFF80] text-xs">-</span>
                    )}
                  </TableCell>

                  {/* Fee Recipient */}
                  <TableCell className="py-2 pl-2 text-white text-sm text-left">
                    {dex.feeRecipient ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-brand-accent font-inter">{formatAddress(dex.feeRecipient)}</span>
                        <button
                          onClick={e => { e.preventDefault(); handleCopy(dex.feeRecipient!); }}
                          className="group p-1 rounded transition-colors"
                        >
                          {copiedAddress === dex.feeRecipient ? (
                            <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
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

