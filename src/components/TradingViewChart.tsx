"use client"

import { useEffect, useRef } from 'react'

let tvScriptLoadingPromise: Promise<void> | null = null

interface TradingViewChartProps {
    symbol?: string
    theme?: "dark" | "light"
    height?: number
    containerId?: string
}

export function TradingViewChart({
    symbol = "BTCUSDT",
    theme = "dark",
    height = 240,
    containerId = "tradingview_chart"
}: TradingViewChartProps) {
    const onLoadScriptRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        onLoadScriptRef.current = createWidget

        if (!tvScriptLoadingPromise) {
            tvScriptLoadingPromise = new Promise((resolve) => {
                const script = document.createElement('script')
                script.id = 'tradingview-widget-loading-script'
                script.src = 'https://s3.tradingview.com/tv.js'
                script.type = 'text/javascript'
                script.onload = resolve as () => void

                document.head.appendChild(script)
            })
        }

        tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current())

        return () => {
            onLoadScriptRef.current = null
        }

        function createWidget() {
            if (document.getElementById(containerId) && 'TradingView' in window) {
                new (window as any).TradingView.widget({
                    width: "100%",
                    height: height,
                    symbol: symbol,
                    interval: "1",
                    timezone: "Etc/UTC",
                    theme: theme,
                    style: "3",
                    locale: "en",
                    enable_publishing: false,
                    hide_top_toolbar: true,
                    hide_legend: true,
                    save_image: false,
                    container_id: containerId,
                    hide_volume: true,
                    hide_side_toolbar: true,
                    allow_symbol_change: false,
                    backgroundColor: "rgba(5, 23, 40, 0.9)",
                    gridColor: "transparent",
                    lineWidth: 2,
                    chartType: "line",
                    studies: [],
                    charts_storage_api_version: "1.1",
                    client_id: "tradingview.com",
                    user_id: "public_user",
                    grid: {
                        vertLines: { visible: false },
                        horzLines: { visible: false }
                    }
                })
            }
        }
    }, [symbol, theme, height, containerId])

    return (
        <div className='tradingview-widget-container h-full mx-1'>
            <div id={containerId} className="w-full h-full" />
        </div>
    )
} 