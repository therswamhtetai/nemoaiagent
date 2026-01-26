"use client"

import { useState, useEffect } from "react"
import { TrendingUp, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

interface MarketData {
  id: string
  company: string
  trend: string
  value: string
  change: number
  created_at: string
}

export default function MarketPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [marketData, setMarketData] = useState<MarketData[]>([])

  useEffect(() => {
    loadMarketData()
  }, [])

  const loadMarketData = async () => {
    const { data, error } = await supabase
      .from("market_intelligence")
      .select("*")
      .order("created_at", { ascending: false })

    if (data && !error) {
      setMarketData(data)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <header className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-zinc-100 font-lettering">Market Intelligence</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-3">
          {marketData.length === 0 ? (
            <Card className="border-zinc-800/50 bg-zinc-900/20 p-8 text-center">
              <p className="text-sm text-zinc-500">No market data available yet.</p>
            </Card>
          ) : (
            marketData.map((data) => (
              <Card
                key={data.id}
                className="border-zinc-800/50 bg-zinc-900/30 p-4 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">{data.company}</h3>
                    <p className="text-xs text-zinc-500">{data.trend}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-200">{data.value}</p>
                    <p className={`text-xs font-medium ${data.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {data.change >= 0 ? "+" : ""}
                      {data.change}%
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
