"use client"

import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { use } from "react"
import { ExplorerHeader } from "@/components/explorer/ExplorerHeader"

interface BlockDetailsProps {
    params: Promise<{
        number: string
    }>
}

export default function BlockDetails({ params }: BlockDetailsProps) {
    const router = useRouter()
    const { number } = use(params)

    // Simulons la récupération des données du block
    const block = {
        number: "648205636",
        hash: "0x64910jdkoeghe6492539820hdke6384ghK3Y49204gd7492",
        time: "13/01/2025 15:36:45",
        transactions: "657",
        proposer: "0xJD649204hdib5482947883jfe",
        size: "1.2 MB",
        gasUsed: "12,450,000",
        gasLimit: "15,000,000",
        baseFeePerGas: "12 Gwei",
        difficulty: "3,450,000",
        totalDifficulty: "58,450,000,000",
        stateRoot: "0x1f4b5d8c7e3a9f2b6d1c4e7b8a5d2c9f1e4b7a3d6c8f9e2b5a8d7c4e1b8a5d2c9",
        parentHash: "0x7a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0",
        nonce: "0x1234567890abcdef",
        transactionsList: [
            {
                hash: "0xc526415bf3d2c9f1e4b7a3d6c8f9e2b5",
                action: "Cancel order",
                block: "648205636",
                time: "0 sec ago",
                user: "0xc526415bf3d2c9f1e4b7a3d6c8f9e2b5",
                value: "0.5 ETH",
                gasPrice: "10 Gwei"
            },
            {
                hash: "0x9f1e4b7a3d6c8f9e2b5a8d7c4e1b8a5d",
                action: "Place order",
                block: "648205636",
                time: "2 sec ago",
                user: "0x7a3d6c8f9e2b5a8d7c4e1b8a5d2c9f1e",
                value: "1.2 ETH",
                gasPrice: "12 Gwei"
            },
            {
                hash: "0x3d6c8f9e2b5a8d7c4e1b8a5d2c9f1e4b",
                action: "Transfer",
                block: "648205636",
                time: "5 sec ago",
                user: "0x2b5a8d7c4e1b8a5d2c9f1e4b7a3d6c8f",
                value: "0.8 ETH",
                gasPrice: "11 Gwei"
            }
        ]
    }

    return (
        <div className="min-h-screen">
            <ExplorerHeader />
            <div className="min-h-screen p-4 lg:p-12 space-y-6">
                {/* Block Information */}
                <h2 className="text-xl text-white font-medium flex items-center gap-2">
                    Block <span className="text-[#F9E370]">{block.number}</span>
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
                                <p className="text-white text-base font-medium">{block.time}</p>
                            </div>
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-2">Hash:</p>
                                <p className="text-[#83E9FF] break-all text-base font-medium hover:text-[#83E9FF]/80 cursor-pointer transition-colors">{block.hash}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[#FFFFFF99] text-sm mb-2">Proposer:</p>
                                <p className="text-[#83E9FF] break-all text-base font-medium hover:text-[#83E9FF]/80 cursor-pointer transition-colors">{block.proposer}</p>
                            </div>
                            <div>
                            <p className="text-[#FFFFFF99] text-sm mb-2">Transactions:</p>
                            <p className="text-white text-base font-medium">{block.transactions}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Transactions Block */}
                <Card className="bg-[#051728CC] h-[550px] border-2 border-[#83E9FF4D] p-0 shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] hover:border-[#83E9FF] transition-colors duration-300">
                    <h2 className="text-xl text-white font-medium p-6 bg-[#051728] border-b border-[#FFFFFF1A] rounded-t-xl">Transactions</h2>
                    <div className="p-6">
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
                                {block.transactionsList.map((tx, index) => (
                                    <tr key={tx.hash} className="text-white border-b border-[#FFFFFF0A] hover:bg-[#FFFFFF0A]">
                                        <td className="text-[#83E9FF] py-4 cursor-pointer hover:text-[#83E9FF]/80 transition-colors">{tx.hash.slice(0, 8)}...{tx.hash.slice(-4)}</td>
                                        <td className="py-4">{tx.action}</td>
                                        <td className="py-4">{tx.block}</td>
                                        <td className="py-4">{tx.time}</td>
                                        <td className="text-[#83E9FF] py-4 cursor-pointer hover:text-[#83E9FF]/80 transition-colors">{tx.user.slice(0, 8)}...{tx.user.slice(-4)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    )
} 