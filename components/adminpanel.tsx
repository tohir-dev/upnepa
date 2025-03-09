"use client";

import { useState, useEffect } from "react";
import { updatePowerLineStatus, updateTransformerStatus } from "../lib/api";
import {
  Activity,
  AlertTriangle,
  Battery,
  BatteryCharging,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Power,
  PowerOff,
  Search,
  Settings,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

const AdminPanel = ({
  powerLines,
  transformers,
  powerStatus,
  updatePowerStatus,
}) => {
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("powerLines");
  const [filterValue, setFilterValue] = useState("");
  const [filteredItems, setFilteredItems] = useState({
    powerLines: [],
    transformers: [],
  });
  const [stats, setStats] = useState({
    activePowerLines: 0,
    activeTransformers: 0,
    totalLoad: 0,
    alerts: 0,
  });

  useEffect(() => {
    setFilteredItems({
      powerLines: powerLines.filter(
        (line) =>
          line.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          line.area.toLowerCase().includes(filterValue.toLowerCase()) ||
          line.type.toLowerCase().includes(filterValue.toLowerCase())
      ),
      transformers: transformers.filter(
        (transformer) =>
          transformer.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          transformer.address.toLowerCase().includes(filterValue.toLowerCase())
      ),
    });
  }, [filterValue, powerLines, transformers]);

  useEffect(() => {
    // Calculate dashboard stats
    const activePowerLines = powerLines.filter(
      (line) => powerStatus[line.id]?.active
    ).length;
    const activeTransformers = transformers.filter(
      (transformer) => powerStatus[transformer.id]?.active
    ).length;

    let totalLoad = 0;
    powerLines.forEach((line) => {
      if (powerStatus[line.id]?.active && powerStatus[line.id]?.load) {
        totalLoad += Number.parseFloat(powerStatus[line.id].load);
      }
    });

    // Count alerts (high load or inactive critical infrastructure)
    let alerts = 0;
    powerLines.forEach((line) => {
      if (
        powerStatus[line.id]?.load > 80 ||
        (line.type === "Transmission" && !powerStatus[line.id]?.active)
      ) {
        alerts++;
      }
    });
    transformers.forEach((transformer) => {
      if (
        powerStatus[transformer.id]?.load > 90 ||
        (transformer.capacity > 1000 && !powerStatus[transformer.id]?.active)
      ) {
        alerts++;
      }
    });

    setStats({
      activePowerLines,
      activeTransformers,
      totalLoad: totalLoad.toFixed(2),
      alerts,
    });
  }, [powerLines, transformers, powerStatus]);

  const handleStatusChange = async (itemId, isActive, itemType) => {
    try {
      setUpdating(true);

      // Call API to update status
      if (itemType === "powerLine") {
        await updatePowerLineStatus(itemId, isActive);
      } else {
        await updateTransformerStatus(itemId, isActive);
      }

      // Update local state
      updatePowerStatus({
        [itemId]: {
          ...powerStatus[itemId],
          active: isActive,
          lastUpdated: new Date().toISOString(),
        },
      });

      setMessage({
        text: `${isActive ? "Activated" : "Deactivated"} ${
          itemType === "powerLine" ? "power line" : "transformer"
        } successfully`,
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      setMessage({ text: "Failed to update status", type: "error" });
    } finally {
      setUpdating(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const getLoadClass = (load) => {
    if (!load) return "text-gray-500";
    const loadNum = Number.parseFloat(load);
    if (loadNum < 50) return "text-green-600";
    if (loadNum < 80) return "text-amber-600";
    return "text-red-600 font-medium";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Grid Management Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and control your power distribution network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {message.text && (
        <Alert
          variant={message.type === "success" ? "default" : "destructive"}
          className="animate-in fade-in-50"
        >
          <AlertTitle>
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 inline mr-2" />
            ) : (
              <AlertTriangle className="h-4 w-4 inline mr-2" />
            )}
            {message.type === "success" ? "Success" : "Error"}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Power Lines
            </CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activePowerLines} / {powerLines.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.activePowerLines / powerLines.length) * 100)}%
              of network active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Transformers
            </CardTitle>
            <BatteryCharging className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeTransformers} / {transformers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (stats.activeTransformers / transformers.length) * 100
              )}
              % operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Load</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLoad} MW</div>
            <p className="text-xs text-muted-foreground">
              Current network power consumption
            </p>
          </CardContent>
        </Card>
        <Card
          className={
            stats.alerts > 0
              ? "border-red-200 bg-red-50 dark:bg-red-950/10"
              : ""
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${
                stats.alerts > 0 ? "text-red-500" : "text-primary"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alerts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.alerts === 0 ? "No issues detected" : "Attention required"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, area, or type..."
          className="max-w-sm"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
      </div>

      <Tabs
        defaultValue="powerLines"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="powerLines" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Power Lines ({filteredItems.powerLines.length})
          </TabsTrigger>
          <TabsTrigger value="transformers" className="flex items-center gap-2">
            <Battery className="h-4 w-4" />
            Transformers ({filteredItems.transformers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="powerLines" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Power Line</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Voltage (kV)</TableHead>
                      <TableHead>Load (MW)</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.powerLines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No power lines found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.powerLines.map((line) => (
                        <TableRow key={line.id} className="group">
                          <TableCell className="font-medium">
                            {line.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {line.area}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{line.type}</Badge>
                          </TableCell>
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
                              {powerStatus[line.id]?.active ? (
                                <span className="flex items-center gap-1">
                                  <Power className="h-3 w-3" /> Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <PowerOff className="h-3 w-3" /> Inactive
                                </span>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {powerStatus[line.id]?.voltage || "N/A"}
                          </TableCell>
                          <TableCell
                            className={getLoadClass(powerStatus[line.id]?.load)}
                          >
                            {powerStatus[line.id]?.load || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {powerStatus[line.id]?.lastUpdated
                                ? formatDate(powerStatus[line.id].lastUpdated)
                                : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <span className="sr-only">Open menu</span>
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(
                                      line.id,
                                      !powerStatus[line.id]?.active,
                                      "powerLine"
                                    )
                                  }
                                  disabled={updating}
                                >
                                  {powerStatus[line.id]?.active ? (
                                    <PowerOff className="mr-2 h-4 w-4" />
                                  ) : (
                                    <Power className="mr-2 h-4 w-4" />
                                  )}
                                  {powerStatus[line.id]?.active
                                    ? "Disable"
                                    : "Enable"}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Activity className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transformers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Transformer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Capacity (kVA)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Load (%)</TableHead>
                      <TableHead>Last Maintenance</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.transformers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No transformers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.transformers.map((transformer) => (
                        <TableRow key={transformer.id} className="group">
                          <TableCell className="font-medium">
                            {transformer.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {transformer.address}
                            </div>
                          </TableCell>
                          <TableCell>{transformer.capacity}</TableCell>
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
                              {powerStatus[transformer.id]?.active ? (
                                <span className="flex items-center gap-1">
                                  <Power className="h-3 w-3" /> Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <PowerOff className="h-3 w-3" /> Inactive
                                </span>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={getLoadClass(
                              powerStatus[transformer.id]?.load
                            )}
                          >
                            {powerStatus[transformer.id]?.load || "0"}%
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {transformer.lastMaintenance}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {powerStatus[transformer.id]?.lastUpdated
                                ? formatDate(
                                    powerStatus[transformer.id].lastUpdated
                                  )
                                : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <span className="sr-only">Open menu</span>
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(
                                      transformer.id,
                                      !powerStatus[transformer.id]?.active,
                                      "transformer"
                                    )
                                  }
                                  disabled={updating}
                                >
                                  {powerStatus[transformer.id]?.active ? (
                                    <PowerOff className="mr-2 h-4 w-4" />
                                  ) : (
                                    <Power className="mr-2 h-4 w-4" />
                                  )}
                                  {powerStatus[transformer.id]?.active
                                    ? "Disable"
                                    : "Enable"}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Activity className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
