"use client";

import { useState, useEffect } from "react";
import {
  calculateSystemHealth,
  calculateAreaStatistics,
} from "../lib/analytics";
import {
  AlertTriangle,
  BarChart3,
  BatteryCharging,
  Bolt,
  Building2,
  ChevronDown,
  CircuitBoard,
  Clock,
  Download,
  MapPin,
  Power,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const Dashboard = ({ powerLines, transformers, powerStatus }) => {
  const [systemHealth, setSystemHealth] = useState({
    percentageActive: 0,
    activeCount: 0,
    totalCount: 0,
  });
  const [areaStats, setAreaStats] = useState({});
  const [areaNames, setAreaNames] = useState([]);
  const [loadData, setLoadData] = useState([]);
  const [timeRange, setTimeRange] = useState("24h");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Calculate system health
    const health = calculateSystemHealth(powerStatus);
    setSystemHealth(health);

    // Calculate area statistics
    const stats = calculateAreaStatistics(
      powerLines,
      transformers,
      powerStatus
    );
    setAreaStats(stats);
    setAreaNames(Object.keys(stats).sort());

    // Generate mock load data for charts
    generateMockLoadData();
  }, [powerLines, transformers, powerStatus]);

  const generateMockLoadData = () => {
    // Generate mock load data for the past 24 hours
    const now = new Date();
    const data = [];

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(now.getHours() - i);

      // Generate random load values for each area
      const areaLoad = {};
      Object.keys(areaStats).forEach((area) => {
        // Base load with some randomness
        const baseLoad = areaStats[area]?.totalLoad || 0;
        const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120% of base load
        areaLoad[area] = Math.round(baseLoad * randomFactor * 10) / 10;
      });

      data.push({
        time: time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        ...areaLoad,
        total: Object.values(areaLoad).reduce((sum, val) => sum + val, 0),
      });
    }

    setLoadData(data);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      generateMockLoadData();
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  const getLoadColor = (load, capacity) => {
    const percentage = (load / capacity) * 100;
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-amber-600";
    return "text-red-600";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalCapacity = () => {
    return transformers.reduce(
      (sum, transformer) => sum + transformer.capacity,
      0
    );
  };

  const getCurrentLoad = () => {
    let totalLoad = 0;
    powerLines.forEach((line) => {
      if (powerStatus[line.id]?.active && powerStatus[line.id]?.load) {
        totalLoad += Number.parseFloat(powerStatus[line.id].load);
      }
    });
    return totalLoad.toFixed(1);
  };

  const getAlertsCount = () => {
    let count = 0;
    // Check for high loads or inactive critical infrastructure
    powerLines.forEach((line) => {
      if (
        powerStatus[line.id]?.load > 80 ||
        (line.type === "Transmission" && !powerStatus[line.id]?.active)
      ) {
        count++;
      }
    });
    transformers.forEach((transformer) => {
      if (
        powerStatus[transformer.id]?.load > 90 ||
        (transformer.capacity > 500 && !powerStatus[transformer.id]?.active)
      ) {
        count++;
      }
    });
    return count;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Lagos Power Grid Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                {timeRange === "24h"
                  ? "Last 24 Hours"
                  : timeRange === "7d"
                  ? "Last 7 Days"
                  : "Last 30 Days"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeRange("24h")}>
                Last 24 Hours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("7d")}>
                Last 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("30d")}>
                Last 30 Days
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Power className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth.percentageActive}%
            </div>
            <div className="flex items-center pt-1">
              <Progress value={systemHealth.percentageActive} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {systemHealth.activeCount} of {systemHealth.totalCount} components
              active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Power Lines</CardTitle>
            <Bolt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {powerLines.filter((line) => powerStatus[line.id]?.active).length}{" "}
              / {powerLines.length}
            </div>
            <div className="flex items-center pt-1">
              <Progress
                value={
                  (powerLines.filter((line) => powerStatus[line.id]?.active)
                    .length /
                    powerLines.length) *
                  100
                }
                className="h-2"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(
                (powerLines.filter((line) => powerStatus[line.id]?.active)
                  .length /
                  powerLines.length) *
                  100
              )}
              % operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transformers</CardTitle>
            <BatteryCharging className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transformers.filter((t) => powerStatus[t.id]?.active).length} /{" "}
              {transformers.length}
            </div>
            <div className="flex items-center pt-1">
              <Progress
                value={
                  (transformers.filter((t) => powerStatus[t.id]?.active)
                    .length /
                    transformers.length) *
                  100
                }
                className="h-2"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(
                (transformers.filter((t) => powerStatus[t.id]?.active).length /
                  transformers.length) *
                  100
              )}
              % operational
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            getAlertsCount() > 0
              ? "border-red-200 bg-red-50 dark:bg-red-950/10"
              : ""
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${
                getAlertsCount() > 0 ? "text-red-500" : "text-primary"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAlertsCount()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {getAlertsCount() === 0
                ? "No issues detected"
                : "Issues requiring attention"}
            </p>
            {getAlertsCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-8 text-xs text-red-600 hover:text-red-700 p-0"
              >
                View all alerts
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Load Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Power Load Distribution</CardTitle>
          <CardDescription>
            Current load: {getCurrentLoad()} MW of {getTotalCapacity()} kVA
            capacity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[700px]">
            <ChartContainer
              config={{
                total: {
                  label: "Total Load",
                  color: "hsl(var(--chart-1))",
                },
                Ikeja: {
                  label: "Ikeja",
                  color: "hsl(var(--chart-2))",
                },
                "Lagos Island": {
                  label: "Lagos Island",
                  color: "hsl(var(--chart-3))",
                },
                Mainland: {
                  label: "Mainland",
                  color: "hsl(var(--chart-4))",
                },
                Ajah: {
                  label: "Ajah",
                  color: "hsl(var(--chart-5))",
                },
                Ikorodu: {
                  label: "Ikorodu",
                  color: "hsl(var(--chart-6))",
                },
              }}
            >
              <AreaChart
                data={loadData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="Ikeja"
                  stackId="1"
                  stroke="var(--color-Ikeja)"
                  fill="var(--color-Ikeja)"
                  fillOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="Lagos Island"
                  stackId="1"
                  stroke="var(--color-Lagos Island)"
                  fill="var(--color-Lagos Island)"
                  fillOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="Mainland"
                  stackId="1"
                  stroke="var(--color-Mainland)"
                  fill="var(--color-Mainland)"
                  fillOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="Ajah"
                  stackId="1"
                  stroke="var(--color-Ajah)"
                  fill="var(--color-Ajah)"
                  fillOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="Ikorodu"
                  stackId="1"
                  stroke="var(--color-Ikorodu)"
                  fill="var(--color-Ikorodu)"
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Area Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Area Statistics</CardTitle>
          <CardDescription>
            Performance metrics by geographical area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2 mb-4">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <CircuitBoard className="h-4 w-4" />
                Table View
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Chart View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Area</TableHead>
                      <TableHead>Power Lines</TableHead>
                      <TableHead>Line Status</TableHead>
                      <TableHead>Transformers</TableHead>
                      <TableHead>Transformer Status</TableHead>
                      <TableHead className="text-right">
                        Total Load (MW)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areaNames.map((area) => (
                      <TableRow key={area}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {area}
                          </div>
                        </TableCell>
                        <TableCell>
                          {areaStats[area].activeLines} /{" "}
                          {areaStats[area].totalLines}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={areaStats[area].percentLineActive}
                              className="h-2 w-24"
                            />
                            <span className="text-xs text-muted-foreground">
                              {areaStats[area].percentLineActive}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {areaStats[area].activeTransformers} /{" "}
                          {areaStats[area].totalTransformers}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={areaStats[area].percentTransformerActive}
                              className="h-2 w-24"
                            />
                            <span className="text-xs text-muted-foreground">
                              {areaStats[area].percentTransformerActive}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {areaStats[area].totalLoad.toFixed(1)} MW
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="chart">
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    "Power Lines": {
                      label: "Power Lines",
                      color: "hsl(var(--chart-1))",
                    },
                    Transformers: {
                      label: "Transformers",
                      color: "hsl(var(--chart-2))",
                    },
                    Load: {
                      label: "Load (MW)",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <BarChart
                    data={areaNames.map((area) => ({
                      area,
                      "Power Lines": areaStats[area].percentLineActive,
                      Transformers: areaStats[area].percentTransformerActive,
                      Load: areaStats[area].totalLoad,
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="Power Lines"
                      fill="var(--color-Power Lines)"
                    />
                    <Bar
                      dataKey="Transformers"
                      fill="var(--color-Transformers)"
                    />
                    <Bar dataKey="Load" fill="var(--color-Load)" />
                  </BarChart>
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Critical Infrastructure */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Infrastructure</CardTitle>
          <CardDescription>
            High-capacity transformers and transmission lines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capacity/Voltage</TableHead>
                  <TableHead>Current Load</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Critical Transformers (capacity > 500) */}
                {transformers
                  .filter((t) => t.capacity > 500)
                  .map((transformer) => (
                    <TableRow key={transformer.id}>
                      <TableCell className="font-medium">
                        {transformer.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Transformer</Badge>
                      </TableCell>
                      <TableCell>
                        {transformer.address.split(",").pop().trim()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            powerStatus[transformer.id]?.active
                              ? "default"
                              : "secondary"
                          }
                          className={
                            powerStatus[transformer.id]?.active
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-200 text-gray-700"
                          }
                        >
                          {powerStatus[transformer.id]?.active
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{transformer.capacity} kVA</TableCell>
                      <TableCell
                        className={getLoadColor(
                          powerStatus[transformer.id]?.load || 0,
                          100
                        )}
                      >
                        {powerStatus[transformer.id]?.load || 0}%
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {powerStatus[transformer.id]?.lastUpdated
                          ? formatDate(powerStatus[transformer.id].lastUpdated)
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}

                {/* Critical Power Lines (Transmission type) */}
                {powerLines
                  .filter((line) => line.type === "Transmission")
                  .map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">{line.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Transmission Line</Badge>
                      </TableCell>
                      <TableCell>{line.area}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            powerStatus[line.id]?.active
                              ? "default"
                              : "secondary"
                          }
                          className={
                            powerStatus[line.id]?.active
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-200 text-gray-700"
                          }
                        >
                          {powerStatus[line.id]?.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {powerStatus[line.id]?.voltage || "N/A"} kV
                      </TableCell>
                      <TableCell
                        className={getLoadColor(
                          powerStatus[line.id]?.load || 0,
                          800
                        )}
                      >
                        {powerStatus[line.id]?.load || "N/A"} MW
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {powerStatus[line.id]?.lastUpdated
                          ? formatDate(powerStatus[line.id].lastUpdated)
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm">
            <Building2 className="h-4 w-4 mr-2" />
            View All Infrastructure
          </Button>
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Maintenance Schedule
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
