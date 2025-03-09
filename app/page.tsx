"use client"

import { useState, useEffect } from "react"
import PowerMap from "@/components/powermap"
import AdminPanel from "@/components/adminpanel"
import Dashboard from "@/components/dashboard"
import { fetchPowerLineData, fetchTransformerData, fetchPowerStatus } from "../lib/api"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, LayoutDashboard, Map, Settings, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [powerLines, setPowerLines] = useState([])
  const [transformers, setTransformers] = useState([])
  const [powerStatus, setPowerStatus] = useState({})
  const [activeView, setActiveView] = useState("map")
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Fetch power line geographical data
        const lines = await fetchPowerLineData()
        setPowerLines(lines)

        // Fetch transformer location data
        const transformerData = await fetchTransformerData()
        setTransformers(transformerData)

        // Fetch initial power status
        const status = await fetchPowerStatus()
        setPowerStatus(status)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Set up real-time updates
    const statusInterval = setInterval(async () => {
      try {
        const status = await fetchPowerStatus()
        setPowerStatus(status)
      } catch (error) {
        console.error("Failed to update power status:", error)
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(statusInterval)
  }, [])

  useEffect(() => {
    // Calculate alerts
    let count = 0
    powerLines.forEach((line) => {
      if (powerStatus[line.id]?.load > 80 || (line.type === "Transmission" && !powerStatus[line.id]?.active)) {
        count++
      }
    })
    transformers.forEach((transformer) => {
      if (
        powerStatus[transformer.id]?.load > 90 ||
        (transformer.capacity > 500 && !powerStatus[transformer.id]?.active)
      ) {
        count++
      }
    })
    setAlerts(count)
  }, [powerLines, transformers, powerStatus])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 border-b sticky top-0 z-10">
        <div className="container mx-auto py-3 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-xl font-bold">Lagos Power Grid Monitor</h1>
            </div>

            <div className="flex items-center space-x-2">
              {alerts > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {alerts} {alerts === 1 ? "Alert" : "Alerts"}
                </Button>
              )}
              <Tabs value={activeView} onValueChange={setActiveView} className="w-full md:w-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="map" className="flex items-center gap-1">
                    <Map className="h-4 w-4" />
                    <span className="hidden sm:inline">Map</span>
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="flex items-center gap-1">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {loading ? (
          <div className="container mx-auto p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
              </div>
              <Skeleton className="h-[300px] rounded-lg" />
            </div>
          </div>
        ) : activeView === "admin" ? (
          <AdminPanel
            powerLines={powerLines}
            transformers={transformers}
            powerStatus={powerStatus}
            updatePowerStatus={(newStatus) => setPowerStatus({ ...powerStatus, ...newStatus })}
          />
        ) : activeView === "dashboard" ? (
          <Dashboard powerLines={powerLines} transformers={transformers} powerStatus={powerStatus} />
        ) : (
          <PowerMap powerLines={powerLines} transformers={transformers} powerStatus={powerStatus} />
        )}
      </main>

      <footer className="bg-white dark:bg-gray-950 border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Lagos Power Grid Monitoring System</p>
        </div>
      </footer>
    </div>
  )
}

