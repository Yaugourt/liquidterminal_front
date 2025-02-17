"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ExplorerHeader } from "@/components/explorer/ExplorerHeader"

export default function Explorer() {
    const transactions = [
        {
            hash: "0x6d458614ffhdb84d366645h5514hh1d64h1h5d4yy11116594r4ruj4",
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
        },
        {
            hash: "0x8f459724ggheb94e477756h6625hh2e75h2h6e5zz22227685s5svk5",
            block: "45125619",
            time: "07/01/2025 09:08:30",
            user: "0xcd5bda51223f1162b6add18f3415d859cc9055fb",
            type: "Cancel order",
            signatureChainId: "0×66ee",
            hyperliquidChain: "Mainnet",
            destination: "0×886118G5c0...05C5f82GC6883",
            token: "USDC:0×7e2f8cef64ba0578c894cb8c641ce165",
            amount: "23.85",
            timestamp: "1736237245580"
        },
        {
            hash: "0x9g560835hhifc05f588867i7736ii3f86i3i7f6aa33338796t6twl6",
            block: "45125620",
            time: "07/01/2025 09:09:45",
            user: "0xef6ceb62334f2273c7add29f4526e859dd9166fc",
            type: "spotSend",
            signatureChainId: "0×66ee",
            hyperliquidChain: "Mainnet",
            destination: "0×977229H6d1...16D6g93HD7994",
            token: "USDC:0×8f3g9dfg75cb1689d905dc752df276",
            amount: "45.32",
            timestamp: "1736237245585"
        }
    ]

    const router = useRouter()

    return (
        <div className="min-h-screen">
            <ExplorerHeader />

            {/* Stats Cards Container */}
            <div className="p-4 md:p-4">
                <div
                    className="bg-[#1692ADB2] rounded-lg p-4 relative"
                    style={{
                        backgroundImage: 'url(/decord.svg), url(/decord1.svg)',
                        backgroundRepeat: 'no-repeat, no-repeat',
                        backgroundSize: 'cover, cover',
                        backgroundPosition: 'center, center'
                    }}
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D]">
                            <div className="flex items-center gap-2">
                                <div className="bg-[#1692AD80] p-1.5 rounded-lg">
                                    <Image
                                        src="/explorer/block.svg"
                                        alt="Block icon"
                                        width={16}
                                        height={16}
                                    />
                                </div>
                                <span className="text-xs text-[#FFFFFF99]">Block</span>
                            </div>
                            <p className="text-sm text-white mt-1.5 text-center">652.365.195</p>
                        </Card>

                        <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D]">
                            <div className="flex items-center gap-2">
                                <div className="bg-[#1692AD80] p-1.5 rounded-lg">
                                    <Image
                                        src="/explorer/Hyperliquid.svg"
                                        alt="HYPE icon"
                                        width={16}
                                        height={16}
                                    />
                                </div>
                                <span className="text-xs text-[#FFFFFF99]">HYPE price</span>
                            </div>
                            <p className="text-sm text-white mt-1.5 text-center">652.365.195</p>
                        </Card>

                        <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D]">
                            <div className="flex items-center gap-2">
                                <div className="bg-[#f9e370] p-1.5 rounded-lg w-6 h-6 flex items-center justify-center">
                                    <span className="text-yellow-400">⬡</span>
                                </div>
                                <span className="text-xs text-[#FFFFFF99]">Validator</span>
                            </div>
                            <p className="text-sm text-white mt-1.5 text-center">652.365.195</p>
                        </Card>

                        <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D]">
                            <div className="flex items-center gap-2">
                                <div className="bg-[#f9e370] p-1.5 rounded-lg w-6 h-6 flex items-center justify-center">
                                    <span className="text-yellow-400">⬡</span>
                                </div>
                                <span className="text-xs text-[#FFFFFF99]">Staked HYPE</span>
                            </div>
                            <p className="text-sm text-white mt-1.5 text-center">652.365.195</p>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Blocks Table */}
            <div className="p-4 md:p-4">
                <Card className="bg-[#051728E5] border border-[#83E9FF4D] p-4">
                    <h3 className="text-white mb-4">Blocks</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-white">
                            <thead className="text-[#FFFFFF99]">
                                <tr>
                                    <th className="text-left py-2">Block</th>
                                    <th className="text-left py-2">Time</th>
                                    <th className="text-left py-2">Hash</th>
                                    <th className="text-left py-2">Proposer</th>
                                    <th className="text-left py-2">Tx</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="border-t border-[#FFFFFF1A]">
                                        <td className="py-4 text-[#83E9FF]">45691547</td>
                                        <td className="py-4">0s ago</td>
                                        <td className="py-4 text-[#83E9FF]">0xc5264...15bf</td>
                                        <td className="py-4 text-[#83E9FF]">0xc5264...15bf</td>
                                        <td className="py-4">268</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Transactions Table */}
            <div className="p-4 md:p-4">
                <Card className="bg-[#051728E5] border border-[#83E9FF4D] p-4">
                    <h3 className="text-white mb-4">Transactions</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-white">
                            <thead className="text-[#FFFFFF99]">
                                <tr>
                                    <th className="text-left py-2">Hash</th>
                                    <th className="text-left py-2">Action</th>
                                    <th className="text-left py-2">Block</th>
                                    <th className="text-left py-2">Time</th>
                                    <th className="text-left py-2">User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction, i) => (
                                    <tr key={i} className="border-t border-[#FFFFFF1A]">
                                        <td className="py-4">
                                            <button
                                                onClick={() => router.push(`/explorer/transaction/${transaction.hash}`)}
                                                className="text-[#83E9FF] hover:text-[#83E9FF]/80 transition-colors"
                                            >
                                                {transaction.hash.slice(0, 6)}...{transaction.hash.slice(-4)}
                                            </button>
                                        </td>
                                        <td className="py-4">{transaction.type}</td>
                                        <td className="py-4 text-[#83E9FF]">{transaction.block}</td>
                                        <td className="py-4">{transaction.time}</td>
                                        <td className="py-4 text-[#83E9FF]">
                                            {transaction.user.slice(0, 6)}...{transaction.user.slice(-4)}
                                        </td>
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
