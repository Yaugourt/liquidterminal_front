"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Données simulées
const mockAddressData = {
  address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97",
  overview: {
    spot: "22,779.55$",
    perps: "0.00$",
    vault: "0.08$",
    staked: "35,942.07$"
  },
  pnl: {
    allTime: "36,815.99$",
    "7D": "16,136.12$",
    "30D": "-31,457.41$",
    "24H": "4,595.31$"
  },
  moreInfo: {
    tags: [],
    transactions: {
      latest: "9 secs ago",
      first: "652 days ago"
    }
  },
  transactions: [
    {
      hash: "0xc5264...15bf",
      method: "InternalTransfer",
      age: "11 hours ago",
      from: "HIP-2",
      to: "0xf1f15061...",
      amount: "7.73",
      token: "SPH",
      price: "9.4025$",
      value: "9,850.41$"
    }
  ]
};

export default function AddressPage() {
  const params = useParams();
  const address = params.address as string;

  return (
    <div className="min-h-screen ">
      {/* Header principal */}
      <header className="  px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-white text-xl font-medium">HyperLiquid L1 explorer</h1>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by Block, Txn Hash, User..." 
                className="bg-[#051728] text-white placeholder-[#8B8B8B] px-4 py-2 rounded-lg w-[400px] border border-[#1E3851] focus:outline-none focus:border-[#83E9FF]"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[#8B8B8B]">HYPE</span>
              <span className="text-white">$21.16</span>
            </div>
            <button className="p-2 hover:bg-[#1E3851] rounded-lg transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#83E9FF" strokeWidth="2">
                <path d="M21.5 12H2.5M21.5 12C21.5 16.9706 17.4706 21 12.5 21M21.5 12C21.5 7.02944 17.4706 3 12.5 3M2.5 12C2.5 16.9706 6.52944 21 11.5 21M2.5 12C2.5 7.02944 6.52944 3 11.5 3" />
              </svg>
            </button>
            <button className="p-2 hover:bg-[#1E3851] rounded-lg transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#83E9FF" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <div className="p-6">
        {/* En-tête de l'adresse */}
        <div className="mb-6">
          <span className="text-[#8B8B8B] text-sm block mb-2">Address</span>
          <div className="flex items-center gap-3">
            <code className="text-[#83E9FF] text-2xl font-medium">{mockAddressData.address}</code>
            <button className="p-2 hover:bg-[#1E3851] rounded-lg transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z" stroke="#83E9FF" strokeWidth="2"/>
                <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="#83E9FF" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Overview Card */}
          <Card className="bg-[#0A1F32] border border-[#1E3851] p-6 rounded-xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-white text-[18px] font-bold">Overview</h3>
              <span className="text-[#83E9FF] text-[18px] font-bold">58,721.70$</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">Spot:</div>
                <div className="text-white text-[16px]">{mockAddressData.overview.spot}</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">Vault:</div>
                <div className="text-white text-[16px]">{mockAddressData.overview.vault}</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">Perps:</div>
                <div className="text-white text-[16px]">{mockAddressData.overview.perps}</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">Staked:</div>
                <div className="text-white text-[16px]">{mockAddressData.overview.staked}</div>
              </div>
            </div>
          </Card>

          {/* PnL Card */}
          <Card className="bg-[#0A1F32] border border-[#1E3851] p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-[18px] font-bold">PnL</h3>
              <select className="bg-[#051728] text-[#83E9FF] border border-[#1E3851] rounded px-3 py-1.5 text-[16px] focus:outline-none focus:border-[#83E9FF]">
                <option value="all">All</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">All Time:</div>
                <div className="text-[#4ADE80] text-[16px]">{mockAddressData.pnl.allTime}</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">30D:</div>
                <div className="text-[#FF5757] text-[16px]">{mockAddressData.pnl["30D"]}</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">7D:</div>
                <div className="text-[#4ADE80] text-[16px]">{mockAddressData.pnl["7D"]}</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">24H:</div>
                <div className="text-[#4ADE80] text-[16px]">{mockAddressData.pnl["24H"]}</div>
              </div>
            </div>
          </Card>

          {/* More Info Card */}
          <Card className="bg-[#0A1F32] border border-[#1E3851] p-6 rounded-xl">
            <h3 className="text-white text-[18px] font-bold mb-6">More Info</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-[16px]">Private name tags</span>
                  <button className="bg-[#F3DC4D] text-black px-3 py-1 rounded text-[14px] font-medium hover:bg-opacity-90 transition-colors">+ Add</button>
                </div>
              </div>
              <div>
                <div className="text-white text-[16px] mb-2">Transactions sent</div>
                <div className="flex gap-6">
                  <div>
                    <span className="text-[rgba(255,255,255,0.8)] text-[16px]">Latest:</span>
                    <span className="text-[#83E9FF] ml-2 text-[16px]">{mockAddressData.moreInfo.transactions.latest}</span>
                  </div>
                  <div>
                    <span className="text-[rgba(255,255,255,0.8)] text-[16px]">First:</span>
                    <span className="text-[#83E9FF] ml-2 text-[16px]">{mockAddressData.moreInfo.transactions.first}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs et Table */}
        <div>
          <div className="flex gap-2 mb-4">
            <button className="bg-[#051728] text-white px-4 py-2 rounded-lg">
              Transactions
            </button>
            <button className="bg-[#1B9AAA] text-white px-4 py-2 rounded-lg hover:bg-[#051728] transition-colors">
              Holdings
            </button>
            <button className="bg-[#1B9AAA] text-white px-4 py-2 rounded-lg hover:bg-[#051728] transition-colors">
              Perps
            </button>
            <button className="bg-[#1B9AAA] text-white px-4 py-2 rounded-lg hover:bg-[#051728] transition-colors">
              Orders
            </button>
            <button className="bg-[#1B9AAA] text-white px-4 py-2 rounded-lg hover:bg-[#051728] transition-colors">
              Vaults
            </button>
            <button className="bg-[#1B9AAA] text-white px-4 py-2 rounded-lg hover:bg-[#051728] transition-colors">
              Staking
            </button>
          </div>
    
          <div className="bg-[#0A1F32] h-[500px] border border-[#1E3851] rounded-xl p-4">
            <table className="w-full">
              <thead>
                <tr className="text-[#8B8B8B] text-sm border-b border-[#1E3851]">
                  <th className="text-left py-3 px-2 font-normal">Hash</th>
                  <th className="text-left py-3 px-2 font-normal">Method</th>
                  <th className="text-left py-3 px-2 font-normal">Age</th>
                  <th className="text-left py-3 px-2 font-normal">From</th>
                  <th className="text-left py-3 px-2 font-normal">To</th>
                  <th className="text-right py-3 px-2 font-normal">Amount</th>
                  <th className="text-left py-3 px-2 font-normal">Token</th>
                  <th className="text-right py-3 px-2 font-normal">Price</th>
                  <th className="text-right py-3 px-2 font-normal">Value</th>
                </tr>
              </thead>
              <tbody>
                {mockAddressData.transactions.map((tx, index) => (
                  <tr key={index} className="text-white border-b border-[#1E3851] text-sm">
                    <td className="py-3 px-2 text-[#83E9FF]">{tx.hash}</td>
                    <td className="py-3 px-2">{tx.method}</td>
                    <td className="py-3 px-2">{tx.age}</td>
                    <td className="py-3 px-2">{tx.from}</td>
                    <td className="py-3 px-2 text-[#83E9FF]">{tx.to}</td>
                    <td className="py-3 px-2 text-right">{tx.amount}</td>
                    <td className="py-3 px-2">{tx.token}</td>
                    <td className="py-3 px-2 text-right">{tx.price}</td>
                    <td className="py-3 px-2 text-right">{tx.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 