import { useState, useMemo, memo } from 'react';
import { useAuctions } from '@/services/market/auction/hooks/useAuctions';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Database, Loader2, Copy, Check } from 'lucide-react';
import Link from "next/link";
import { useNumberFormat } from '@/store/number-format.store';
import { useDateFormat } from '@/store/date-format.store';
import { formatDateTime } from '@/lib/dateFormatting';

// TableHeaderCell strictement identique à SpotTokenTable
const TableHeaderCell = memo(({ label, onClick, className, isActive }: { label: string; onClick?: () => void; className?: string; isActive?: boolean }) => (
  <TableHead className={className}>
    <Button
      variant="ghost"
      onClick={onClick}
      className={`${isActive ? "text-[#f9e370] hover:text-[#f9e370]" : "text-white hover:text-white"} font-normal p-0 flex items-center justify-start w-full`}
    >
      {label}
      {onClick && <ArrowUpDown className="ml-2 h-4 w-4" />}
    </Button>
  </TableHead>
));
TableHeaderCell.displayName = 'TableHeaderCell';

// EmptyState strictement identique
const EmptyState = memo(() => (
  <TableRow>
    <TableCell colSpan={5} className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg">Aucune auction disponible</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">Vérifiez plus tard</p>
      </div>
    </TableCell>
  </TableRow>
));
EmptyState.displayName = 'EmptyState';

const columns = [
  { key: 'time', label: 'Date', sortable: true, className: 'pl-4 w-[16%] text-left' },
  { key: 'name', label: 'Name', sortable: false, className: 'pl-2 w-[12%] text-left' },
  { key: 'deployer', label: 'Deployer', sortable: false, className: 'pl-2 w-[16%] text-left' },
  { key: 'tokenId', label: 'Token Address', sortable: false, className: 'pl-2 w-[16%] text-left' },
  { key: 'index', label: 'Index', sortable: false, className: 'pl-2 pr-4 w-[10%] text-center' },
  { key: 'gasHype', label: 'Gas (HYPE)', sortable: true, className: 'pl-4 pr-2 w-[15%] text-left' },
  { key: 'gasUsdc', label: 'Gas (USDC)', sortable: true, className: 'pl-4 pr-4 w-[15%] text-left' },
];

// Format court pour l'adresse
const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export function AuctionTable() {
  const { auctions, isLoading, error } = useAuctions({ currency: 'ALL', limit: 100 });
  const [sortField, setSortField] = useState('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 1200);
    } catch {}
  };

  // Tri local
  const sortedAuctions = useMemo(() => {
    return [...auctions].sort((a, b) => {
      let aValue: number | string, bValue: number | string;
      switch (sortField) {
        case 'time':
          aValue = a.time;
          bValue = b.time;
          break;
        case 'gasHype':
          aValue = a.currency === 'HYPE' ? parseFloat(a.deployGas) : 0;
          bValue = b.currency === 'HYPE' ? parseFloat(b.deployGas) : 0;
          break;
        case 'gasUsdc':
          aValue = a.currency === 'USDC' ? parseFloat(a.deployGas) : 0;
          bValue = b.currency === 'USDC' ? parseFloat(b.deployGas) : 0;
          break;
        default:
          aValue = (a as any)[sortField] || 0;
          bValue = (b as any)[sortField] || 0;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [auctions, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
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
          <span className="text-red-500 text-lg">Erreur lors du chargement des auctions</span>
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
              {columns.map(col => (
                col.sortable ? (
                  <TableHeaderCell
                    key={col.key}
                    label={col.label}
                    onClick={() => handleSort(col.key)}
                    isActive={sortField === col.key}
                    className={`text-white font-normal py-1 bg-[#051728] text-sm ${col.className}`}
                  />
                ) : (
                  <TableHead
                    key={col.key}
                    className={`text-white font-normal py-1 bg-[#051728] text-sm ${col.className}`}
                  >
                    {col.label}
                  </TableHead>
                )
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {sortedAuctions.length === 0 ? (
              <EmptyState />
            ) : (
              sortedAuctions.map((auction) => (
                <TableRow key={auction.tokenId} className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors cursor-pointer">
                  <TableCell className="py-2 pl-4 text-white text-sm text-left">{formatDateTime(auction.time, dateFormat)}</TableCell>
                  <TableCell className="py-2 pl-2 text-white text-sm text-left">{auction.name}</TableCell>
                  <TableCell className="py-2 pl-2 text-white text-sm text-left">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/explorer/address/${auction.deployer}`} className="text-[#83E9FF] font-inter hover:text-[#83E9FF]/80 transition-colors">{formatAddress(auction.deployer)}</Link>
                      <button onClick={e => { e.preventDefault(); handleCopy(auction.deployer); }} className="group p-1 rounded transition-colors">{copiedAddress === auction.deployer ? (<Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />) : (<Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />)}</button>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 pl-2 text-white text-sm text-left">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/explorer/address/${auction.tokenId}`} className="text-[#83E9FF] font-inter hover:text-[#83E9FF]/80 transition-colors">{formatAddress(auction.tokenId)}</Link>
                      <button onClick={e => { e.preventDefault(); handleCopy(auction.tokenId); }} className="group p-1 rounded transition-colors">{copiedAddress === auction.tokenId ? (<Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />) : (<Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />)}</button>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 pl-2 pr-4 text-white text-sm text-center w-[10%]">{auction.index}</TableCell>
                  <TableCell className="py-2 pl-4 pr-2 text-white text-sm text-left w-[15%]">{auction.currency === 'HYPE' ? auction.deployGas : '-'}</TableCell>
                  <TableCell className="py-2 pl-4 pr-4 text-white text-sm text-left w-[15%]">{auction.currency === 'USDC' ? auction.deployGas : '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
} 