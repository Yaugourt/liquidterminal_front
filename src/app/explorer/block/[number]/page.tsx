"use client"

import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useBlockDetails } from "@/services/explorer/hooks/useBlockDetails"
import { UnifiedHeader } from "@/components/UnifiedHeader"
import { format } from "date-fns"
import { use, useState } from "react"
import { Pagination } from "@/components/explorer/Pagination"

const ITEMS_PER_PAGE = 10;

interface BlockDetailsProps {
    params: Promise<{
        number: string
    }>
}

export default function BlockDetails({ params }: BlockDetailsProps) {
    const router = useRouter()
    const { number } = use(params)
    const { blockDetails, isLoading, error } = useBlockDetails(number);
    const [currentPage, setCurrentPage] = useState(1);

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <UnifiedHeader customTitle="Explorer" />
                <div className="min-h-screen p-4 lg:p-12 space-y-6">
                    <div className="text-white text-center">Loading block details...</div>
                </div>
            </div>
        );
    }

    if (error || !blockDetails) {
        return (
            <div className="min-h-screen">
                <UnifiedHeader customTitle="Explorer" />
                <div className="min-h-screen p-4 lg:p-12 space-y-6">
                    <div className="text-red-500 text-center">{error?.message || 'Failed to load block details'}</div>
                </div>
            </div>
        );
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const displayedTransactions = blockDetails.txs.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen">
            <UnifiedHeader customTitle="Explorer" />
            <div className="min-h-screen p-4 lg:p-12 space-y-6">
                {/* Block Information */}
                <h2 className="text-xl text-white font-medium flex items-center gap-2">
                    Block <span className="text-[#F9E370]">{blockDetails.height}</span>
                    <button className="p-2 hover:bg-[#1E3851] rounded-lg transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z" stroke="#83E9FF" strokeWidth="2"/>
                <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="#83E9FF" strokeWidth="2"/>
              </svg>
            </button>
                </h2>
                <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] p-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] hover:border-[#83E9FF] transition-colors duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-2">Time:</p>
                                <p className="text-white text-base font-medium">
                                    {format(blockDetails.blockTime, 'dd/MM/yyyy HH:mm:ss')}
                                </p>
                            </div>
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-2">Hash:</p>
                                <p className="text-[#83E9FF] break-all text-base font-medium hover:text-[#83E9FF]/80 cursor-pointer transition-colors">
                                    {blockDetails.hash}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-2">Proposer:</p>
                                <p className="text-[#83E9FF] break-all text-base font-medium hover:text-[#83E9FF]/80 cursor-pointer transition-colors">
                                    {blockDetails.proposer}
                                </p>
                            </div>
                            <div>
                            <p className="text-[#FFFFFF99] text-sm mb-2">Transactions:</p>
                                <p className="text-white text-base font-medium">{blockDetails.numTxs}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Transactions Block */}
                <Card className="bg-[#051728CC] h-[650px] border-2 border-[#83E9FF4D] p-0 shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] hover:border-[#83E9FF] transition-colors duration-300">
                    <h2 className="text-xl text-white font-medium p-6 bg-[#051728] border-b border-[#FFFFFF1A] rounded-t-xl">Transactions</h2>
                    <div className="p-6 flex flex-col h-[calc(100%-80px)]">
                        <div className="flex-1 overflow-auto">
                        <table className="w-full text-base">
                            <thead>
                                <tr className="text-[#FFFFFF99] border-b border-[#FFFFFF1A]">
                                    <th className="text-left pb-4">Hash</th>
                                    <th className="text-left pb-4">Action</th>
                                    <th className="text-left pb-4">Block</th>
                                    <th className="text-left pb-4">Time</th>
                                    <th className="text-left pb-4">User</th>
                                </tr>
                            </thead>
                            <tbody>
                                    {displayedTransactions.map((tx) => (
                                    <tr key={tx.hash} className="text-white border-b border-[#FFFFFF0A] hover:bg-[#FFFFFF0A]">
                                            <td className="text-[#83E9FF] py-4 cursor-pointer hover:text-[#83E9FF]/80 transition-colors">
                                                {tx.hash.slice(0, 8)}...{tx.hash.slice(-4)}
                                            </td>
                                            <td className="py-4">{tx.action.type}</td>
                                            <td className="py-4">{tx.block}</td>
                                            <td className="py-4">{format(tx.time, 'dd/MM/yyyy HH:mm:ss')}</td>
                                            <td className="text-[#83E9FF] py-4 cursor-pointer hover:text-[#83E9FF]/80 transition-colors">
                                                {tx.user.slice(0, 8)}...{tx.user.slice(-4)}
                                            </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={blockDetails.txs.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </Card>
            </div>
        </div>
    )
} 