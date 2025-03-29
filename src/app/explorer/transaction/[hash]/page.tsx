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
                                <p className="text-[#83E9FF] break-all text-base">{transaction.hash}</p>
                            </div>
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-1">Time:</p>
                                <p className="text-white text-base">{transaction.time}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-1">Block:</p>
                                <p className="text-[#F9E370] text-base">{transaction.block}</p>
                            </div>
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-1">User:</p>
                                <p className="text-[#83E9FF] break-all text-base">{transaction.user}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Overview Block */}
                <Card className="bg-[#051728CC] border-2 border-[#83E9FF4D] p-0 shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
                    <h2 className="text-xl text-white font-medium p-6 bg-[#051728] border-b border-[#FFFFFF1A] rounded-t-xl">Overview</h2>
                    <div className="p-6">
                        <table className="w-full text-base">
                            <tbody className="space-y-4">
                                <tr className="flex justify-between py-2">
                                    <td className="text-[#FFFFFF99]">Type:</td>
                                    <td className="text-white">{transaction.type}</td>
                                </tr>
                                <tr className="flex justify-between py-2">
                                    <td className="text-[#FFFFFF99]">SignatureChainId:</td>
                                    <td className="text-[#83E9FF]">{transaction.signatureChainId}</td>
                                </tr>
                                <tr className="flex justify-between py-2">
                                    <td className="text-[#FFFFFF99]">HyperliquidChain:</td>
                                    <td className="text-white">{transaction.hyperliquidChain}</td>
                                </tr>
                                <tr className="flex justify-between py-2">
                                    <td className="text-[#FFFFFF99]">Destination:</td>
                                    <td className="text-white break-all text-right">{transaction.destination}</td>
                                </tr>
                                <tr className="flex justify-between py-2">
                                    <td className="text-[#FFFFFF99]">Token:</td>
                                    <td className="text-white">{transaction.token}</td>
                                </tr>
                                <tr className="flex justify-between py-2">
                                    <td className="text-[#FFFFFF99]">Amount:</td>
                                    <td className="text-white">{transaction.amount}</td>
                                </tr>
                                <tr className="flex justify-between py-2">
                                    <td className="text-[#FFFFFF99]">Time:</td>
                                    <td className="text-white">{transaction.timestamp}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    )
} 