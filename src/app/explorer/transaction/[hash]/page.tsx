"use client"

import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { use } from "react"
import { ExplorerHeader } from "@/components/explorer/ExplorerHeader"

interface TransactionDetailsProps {
    params: Promise<{
        hash: string
    }>
}

export default function TransactionDetails({ params }: TransactionDetailsProps) {
    const router = useRouter()
    const { hash } = use(params)

    // Simulons la récupération des données de transaction
    const transaction = {
        hash: hash,
        block: "45125618",
        time: "07/01/2025 09:07:25",
        user: "0xab4ada40112e0051a5add07f2304d749bb8944fa",
        type: "spotSend",
        signatureChainId: "0×66ee",
        hyperliquidChain: "Mainnet",
        destination: "0×796007F4b9...94B4e71FB5772",
        token: "USDC:0×6d1e7cde53ba9467b783cb7c530ce054",
        amount: "11.47",
        timestamp: "1736237245575"
    }

    return (
        <div className="min-h-screen">
            <ExplorerHeader />
            <div className="min-h-screen p-4 space-y-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#83E9FF] hover:text-[#83E9FF]/80 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                {/* Transaction Block - Style normal */}
                <h2 className="text-lg text-white mb-4">Transaction</h2>
                <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] p-4">
                    <div className="space-y-3">
                        <div>
                            <p className="text-[#FFFFFF99] text-sm">Hash:</p>
                            <p className="text-[#83E9FF] break-all">{transaction.hash}</p>
                        </div>
                        <div>
                            <p className="text-[#FFFFFF99] text-sm">Block:</p>
                            <p className="text-[#F9E370]">{transaction.block}</p>
                        </div>
                        <div>
                            <p className="text-[#FFFFFF99] text-sm">Time:</p>
                            <p className="text-white">{transaction.time}</p>
                        </div>
                        <div>
                            <p className="text-[#FFFFFF99] text-sm">User:</p>
                            <p className="text-[#83E9FF] break-all">{transaction.user}</p>
                        </div>
                    </div>
                </Card>

                {/* Overview Block - Style en ligne */}
                <Card className="bg-[#051728CC] border-2 border-[#83E9FF4D] p-0">
                    <h2 className="text-lg text-white p-4 bg-[#051728] border-b border-[#FFFFFF1A] rounded-t-xl">Overview</h2>
                    <div className="p-4">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="flex justify-between">
                                    <td className="py-2 text-[#FFFFFF99]">Type:</td>
                                    <td className="py-2 text-white">{transaction.type}</td>
                                </tr>
                                <tr className="flex justify-between">
                                    <td className="py-2 text-[#FFFFFF99]">SignatureChainId:</td>
                                    <td className="py-2 text-[#83E9FF]">{transaction.signatureChainId}</td>
                                </tr>
                                <tr className="flex justify-between">
                                    <td className="py-2 text-[#FFFFFF99]">HyperliquidChain:</td>
                                    <td className="py-2 text-white">{transaction.hyperliquidChain}</td>
                                </tr>
                                <tr className="flex justify-between">
                                    <td className="py-2 text-[#FFFFFF99]">Destination:</td>
                                    <td className="py-2 text-white break-all text-right">{transaction.destination}</td>
                                </tr>
                                <tr className="flex justify-between">
                                    <td className="py-2 text-[#FFFFFF99]">Token:</td>
                                    <td className="py-2 text-white">{transaction.token}</td>
                                </tr>
                                <tr className="flex justify-between">
                                    <td className="py-2 text-[#FFFFFF99]">Amount:</td>
                                    <td className="py-2 text-white">{transaction.amount}</td>
                                </tr>
                                <tr className="flex justify-between">
                                    <td className="py-2 text-[#FFFFFF99]">Time:</td>
                                    <td className="py-2 text-white">{transaction.timestamp}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    )
} 