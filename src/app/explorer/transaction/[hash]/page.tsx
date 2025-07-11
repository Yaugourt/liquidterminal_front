"use client"

import { useTransactionDetails } from '@/services/explorer';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import {  Header } from "@/components/Header"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

export default function TransactionPage() {
    const params = useParams();
    const txHash = params.hash as string;
    const { transactionDetails, isLoading, error } = useTransactionDetails(txHash);
    const router = useRouter()

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!transactionDetails) {
        return <div>Transaction not found</div>;
    }

    return (
        <div className="min-h-screen">
            < Header customTitle="Explorer" showFees={true} />
            <div className="min-h-screen p-4 lg:p-12 space-y-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#83E9FF] hover:text-[#83E9FF]/80 transition-colors mb-2"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                {/* Transaction Block */}
                <h2 className="text-xl text-white font-medium">Transaction</h2>
                <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] p-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-1">Hash:</p>
                                <p className="text-[#83E9FF] break-all text-base">{transactionDetails.hash}</p>
                            </div>
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-1">Time:</p>
                                <p className="text-white text-base">{format(transactionDetails.time, 'dd/MM/yyyy HH:mm:ss')}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-1">Block:</p>
                                <p className="text-[#F9E370] text-base">{transactionDetails.block}</p>
                            </div>
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-1">User:</p>
                                <p className="text-[#83E9FF] break-all text-base">{transactionDetails.user}</p>
                            </div>
                        </div>
                    </div>

                    {/* Overview Block */}
                    <Card className="bg-[#051728CC] border-2 border-[#83E9FF4D] p-0 shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] mt-6">
                        <h2 className="text-xl text-white font-medium p-6 bg-[#051728] border-b border-[#FFFFFF1A] rounded-t-xl">Overview</h2>
                        <div className="p-6">
                            <Table className="w-full text-base">
                                <TableBody className="space-y-4">
                                    <TableRow className="flex justify-between py-2">
                                        <TableCell className="text-[#FFFFFF99]">Type:</TableCell>
                                        <TableCell className="text-white">{transactionDetails.action.type}</TableCell>
                                    </TableRow>
                                    {transactionDetails.action.cancels && (
                                        <TableRow className="flex justify-between py-2">
                                            <TableCell className="text-[#FFFFFF99]">Cancels:</TableCell>
                                            <TableCell className="text-white">
                                                <div className="space-y-2">
                                                    {transactionDetails.action.cancels.map((cancel, index) => (
                                                        <div key={index} className="bg-[#83E9FF4D] p-2 rounded">
                                                            <p>Asset: {cancel.a}</p>
                                                            <p>Order: {cancel.o}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {transactionDetails.error && (
                                        <TableRow className="flex justify-between py-2">
                                            <TableCell className="text-[#FFFFFF99]">Error:</TableCell>
                                            <TableCell className="text-red-500">{transactionDetails.error}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </Card>
            </div>
        </div>
    )
} 