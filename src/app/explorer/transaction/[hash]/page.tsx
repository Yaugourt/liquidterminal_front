"use client"

import { useTransactionDetails } from '@/services/explorer';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import {  Header } from "@/components/Header"

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
                            <table className="w-full text-base">
                                <tbody className="space-y-4">
                                    <tr className="flex justify-between py-2">
                                        <td className="text-[#FFFFFF99]">Type:</td>
                                        <td className="text-white">{transactionDetails.action.type}</td>
                                    </tr>
                                    {transactionDetails.action.cancels && (
                                        <tr className="flex justify-between py-2">
                                            <td className="text-[#FFFFFF99]">Cancels:</td>
                                            <td className="text-white">
                                                <div className="space-y-2">
                                                    {transactionDetails.action.cancels.map((cancel, index) => (
                                                        <div key={index} className="bg-[#83E9FF4D] p-2 rounded">
                                                            <p>Asset: {cancel.a}</p>
                                                            <p>Order: {cancel.o}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {transactionDetails.error && (
                                        <tr className="flex justify-between py-2">
                                            <td className="text-[#FFFFFF99]">Error:</td>
                                            <td className="text-red-500">{transactionDetails.error}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </Card>
            </div>
        </div>
    )
} 