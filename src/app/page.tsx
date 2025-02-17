"use client"

import { useEffect } from "react"
import { usePageTitle } from "@/store/use-page-title"
import { SearchBar } from "@/components/SearchBar"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { TradingViewChart } from "@/components/TradingViewChart"
import { useWindowSize } from "@/hooks/use-window-size"

export default function Home() {
  const { setTitle } = usePageTitle()
  const { width } = useWindowSize()
  const chartHeight = width >= 1024 ? 345 : 296

  useEffect(() => {
    setTitle("Dashboard")
  }, [setTitle])

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      {/* SearchBar visible uniquement sur mobile et tablette */}
      <div className="p-2 lg:hidden">
        <SearchBar placeholder="Search..." />
      </div>

      {/* Main Content */}
      <main className="p-2 mt-[5%] lg:p-8 space-y-3 lg:space-y-8">
        {/* Top Stats Cards - 3 en ligne */}
        <div className="grid grid-cols-3 gap-2 lg:gap-8">
          <Card className="p-2 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <div className="bg-[#112941] p-1.5 rounded-full shrink-0">
                <Image
                  src="/User_alt_fill.svg"
                  alt="User icon"
                  width={16}
                  height={16}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xs lg:text-sm text-[#FFFFFF99]">Total user</h3>
                <p className="text-sm lg:text-base text-white">652.365.195</p>
              </div>
            </div>
          </Card>

          <Card className="p-2 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <div className="bg-[#112941] p-1.5 rounded-full shrink-0">
                <Image
                  src="/Ticket_fill.svg"
                  alt="Ticket icon"
                  width={16}
                  height={16}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xs lg:text-sm text-[#FFFFFF99]">Total spend in auction</h3>
                <p className="text-sm lg:text-base text-white">652.365.195</p>
              </div>
            </div>
          </Card>

          <Card className="p-2 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <div className="bg-[#112941] p-1.5 rounded-full w-7 h-7 flex items-center justify-center shrink-0">
                <span className="text-[#83E9FF] text-sm">$</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xs lg:text-sm text-[#FFFFFF99]">Total volume</h3>
                <p className="text-sm lg:text-base text-white">652.365.195</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Section Graphique + 4 Cards */}
        <div className="lg:flex lg:gap-8">
          {/* Grande carte avec graphique */}
          <Card className="h-[300px] lg:flex-1 lg:h-[350px] relative bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
            {/* Texte superposé */}
            <div className="absolute top-4 left-6 z-10">
              <h3 className="text-xs lg:text-sm text-[#FFFFFF99]">Spot USDC</h3>
              <p className="text-sm lg:text-base text-[#83E9FF]">45.8M</p>
            </div>

            {/* Chart en plein écran */}
            <div className="absolute inset-0">
              <TradingViewChart
                symbol="BTCUSDT"
                theme="dark"
                height={chartHeight}
                containerId="tradingview_chart_1"
              />
            </div>
          </Card>

          {/* 4 petites cartes en carré */}
          <div className="mt-3 lg:mt-0 lg:w-[352px]">
            <div className="grid grid-cols-4 gap-4 lg:grid-cols-2 lg:gap-8">
              <Card className="p-2 lg:p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm lg:h-[115px] lg:w-[150px]">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs lg:text-[16px] text-[#FFFFFF99]">24h spot volume</h3>
                  <p className="text-sm lg:text-xl text-white">652.195</p>
                </div>
              </Card>

              <Card className="p-2 lg:p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm lg:h-[115px] lg:w-[150px]">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs lg:text-[16px] text-[#FFFFFF99]">24h spot tokens</h3>
                  <p className="text-sm lg:text-xl text-white">652.195</p>
                </div>
              </Card>

              <Card className="p-2 lg:p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm lg:h-[115px] lg:w-[150px]">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs lg:text-[16px] text-[#FFFFFF99]">24h spot marketcap</h3>
                  <p className="text-sm lg:text-xl text-white">652.195</p>
                </div>
              </Card>

              <Card className="p-2 lg:p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm lg:h-[115px] lg:w-[150px]">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs lg:text-[16px] text-[#FFFFFF99]">total spot tokens</h3>
                  <p className="text-sm lg:text-xl text-white">652.195</p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Section Bottom */}
        <div className="lg:flex lg:gap-8">
          {/* 2 cartes à gauche */}
          <div className="flex gap-4 lg:grid lg:grid-cols-1 lg:w-[400px] lg:gap-8">
            <Card className="p-2 lg:p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm w-1/2 lg:w-full lg:h-[160px]">
              <div className="flex flex-col gap-4">
                <h3 className="text-xs lg:text-[16px] text-[#FFFFFF99]">Total HYPE burn</h3>
                <p className="text-sm lg:text-xl text-white">652.365.195</p>
              </div>
            </Card>
            <Card className="p-2 lg:p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm w-1/2 lg:w-full lg:h-[160px]">
              <div className="flex flex-col gap-4">
                <h3 className="text-xs lg:text-[16px] text-[#FFFFFF99]">Total HLP deposit</h3>
                <p className="text-sm lg:text-xl text-white">652.365.195</p>
              </div>
            </Card>
          </div>

          {/* Grande carte avec graphique */}
          <Card className="h-[300px] mt-3 lg:mt-0 lg:flex-1 lg:h-[350px] relative bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
            <div className="absolute top-4 left-6 z-10">
              <h3 className="text-xs lg:text-sm text-[#FFFFFF99]">Last auction price and auction evolution</h3>
            </div>

            <div className="absolute inset-0">
              <TradingViewChart
                symbol="ETHUSDT"
                theme="dark"
                height={chartHeight}
                containerId="tradingview_chart_2"
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
