"use client"

import { useState, useRef, useEffect } from "react"
import { GoogleMap, LoadScript, Polyline, Marker, InfoWindow, Circle } from "@react-google-maps/api"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  AlertTriangle,
  BatteryCharging,
  Bolt,
  Compass,
  Eye,
  EyeOff,
  Filter,
  Layers,
  MapPin,
  Maximize,
  Minimize,
  Power,
  PowerOff,
  Search,
} from "lucide-react"

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 140px)",
}

const lagos = {
  lat: 6.5244,
  lng: 3.3792,
}

const mapStyles = [
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#444444" }],
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#f2f2f2" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [{ saturation: -100 }, { lightness: 45 }],
  },
  {
    featureType: "road.highway",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#c4e5f9" }, { visibility: "on" }],
  },
]

const PowerMap = ({ powerLines, transformers, powerStatus }) => {
  const [selectedLine, setSelectedLine] = useState(null)
  const [selectedTransformer, setSelectedTransformer] = useState(null)
  const [mapType, setMapType] = useState("roadmap")
  const [zoom, setZoom] = useState(13)
  const [filters, setFilters] = useState({
    showTransmissionLines: true,
    showDistributionLines: true,
    showStreetLines: true,
    showActiveTransformers: true,
    showInactiveTransformers: true,
    showActiveLines: true,
    showInactiveLines: true,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)

  const handleMapLoad = (map) => {
    mapRef.current = map
    setMapLoaded(true)
  }

  const getLineOptions = (line) => {
    const isActive = powerStatus[line.id]?.active || false
    const lineType = line.type

    let strokeColor = "#555555" // Default inactive color
    let strokeWeight = 2
    let zIndex = 1

    if (isActive) {
      if (lineType === "Transmission") {
        strokeColor = "#FFD700" // Gold for transmission lines
        strokeWeight = 4
        zIndex = 4
      } else if (lineType === "Distribution") {
        strokeColor = "#4CAF50" // Green for distribution lines
        strokeWeight = 3
        zIndex = 3
      } else {
        strokeColor = "#2196F3" // Blue for street distribution
        strokeWeight = 2
        zIndex = 2
      }
    }

    return {
      strokeColor,
      strokeOpacity: isActive ? 1.0 : 0.6,
      strokeWeight,
      clickable: true,
      draggable: false,
      editable: false,
      visible: true,
      zIndex,
      icons:
        isActive && lineType !== "Street Distribution"
          ? [
              {
                icon: {
                  path: "M 0,-1 0,1",
                  strokeOpacity: 1,
                  strokeWeight: 2,
                  scale: 3,
                  strokeColor,
                },
                offset: "0",
                repeat: "20px",
              },
            ]
          : [],
    }
  }

  const getTransformerIcon = (transformer) => {
    const isActive = powerStatus[transformer.id]?.active || false
    const load = powerStatus[transformer.id]?.load || 0
    const isHighCapacity = transformer.capacity > 500

    let fillColor = "#555555" // Default inactive color

    if (isActive) {
      if (load > 90) {
        fillColor = "#FF5252" // Red for high load
      } else if (load > 70) {
        fillColor = "#FFC107" // Amber for medium load
      } else {
        fillColor = "#4CAF50" // Green for low load
      }
    }

    return {
      path: isHighCapacity
        ? "M-3,-3 L3,-3 L3,3 L-3,3 Z" // Larger square for high capacity
        : "M-2,-2 L2,-2 L2,2 L-2,2 Z", // Standard square
      fillColor,
      fillOpacity: 1,
      strokeColor: "#000000",
      strokeWeight: 1,
      scale: isHighCapacity ? 5 : 4,
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results = []

    // Search power lines
    powerLines.forEach((line) => {
      if (
        line.name.toLowerCase().includes(query) ||
        line.area.toLowerCase().includes(query) ||
        line.type.toLowerCase().includes(query)
      ) {
        results.push({
          id: line.id,
          name: line.name,
          type: "Power Line",
          subtype: line.type,
          area: line.area,
          position: line.path[Math.floor(line.path.length / 2)],
          status: powerStatus[line.id]?.active ? "Active" : "Inactive",
          item: line,
        })
      }
    })

    // Search transformers
    transformers.forEach((transformer) => {
      if (transformer.name.toLowerCase().includes(query) || transformer.address.toLowerCase().includes(query)) {
        results.push({
          id: transformer.id,
          name: transformer.name,
          type: "Transformer",
          subtype: `${transformer.capacity} kVA`,
          area: transformer.address.split(",").pop().trim(),
          position: transformer.position,
          status: powerStatus[transformer.id]?.active ? "Active" : "Inactive",
          item: transformer,
        })
      }
    })

    setSearchResults(results)
  }

  const handleResultClick = (result) => {
    if (result.type === "Power Line") {
      setSelectedLine(result.item)
      setSelectedTransformer(null)
    } else {
      setSelectedTransformer(result.item)
      setSelectedLine(null)
    }

    // Center map on the selected item
    if (mapRef.current) {
      mapRef.current.panTo(result.position)
      setZoom(15)
    }
  }

  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom()
      mapRef.current.setZoom(currentZoom + 1)
      setZoom(currentZoom + 1)
    }
  }

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom()
      mapRef.current.setZoom(currentZoom - 1)
      setZoom(currentZoom - 1)
    }
  }

  const toggleFilter = (filterName) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName],
    })
  }

  const filteredPowerLines = powerLines.filter((line) => {
    const isActive = powerStatus[line.id]?.active || false

    if (isActive && !filters.showActiveLines) return false
    if (!isActive && !filters.showInactiveLines) return false

    if (line.type === "Transmission" && !filters.showTransmissionLines) return false
    if (line.type === "Distribution" && !filters.showDistributionLines) return false
    if (line.type === "Street Distribution" && !filters.showStreetLines) return false

    return true
  })

  const filteredTransformers = transformers.filter((transformer) => {
    const isActive = powerStatus[transformer.id]?.active || false

    if (isActive && !filters.showActiveTransformers) return false
    if (!isActive && !filters.showInactiveTransformers) return false

    return true
  })

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getLoadClass = (load) => {
    if (!load) return "text-gray-500"
    const loadNum = Number.parseFloat(load)
    if (loadNum < 50) return "text-green-600"
    if (loadNum < 80) return "text-amber-600"
    return "text-red-600 font-medium"
  }

  // Count active/inactive components
  const activeLines = powerLines.filter((line) => powerStatus[line.id]?.active).length
  const activeTransformers = transformers.filter((t) => powerStatus[t.id]?.active).length

  // Count alerts
  const alerts = [...powerLines, ...transformers].filter((item) => {
    const status = powerStatus[item.id]
    if (!status) return false

    if ("capacity" in item) {
      // It's a transformer
      return status.load > 90 || (item.capacity > 500 && !status.active)
    } else {
      // It's a power line
      return status.load > 80 || (item.type === "Transmission" && !status.active)
    }
  }).length

  useEffect(() => {
    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedLine(null)
        setSelectedTransformer(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="relative h-full">
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={lagos}
          zoom={zoom}
          onLoad={handleMapLoad}
          mapTypeId={mapType}
          options={{
            mapTypeControl: false,
            streetViewControl: true,
            fullscreenControl: false,
            zoomControl: false,
            styles: mapStyles,
          }}
        >
          {/* Render power lines */}
          {filteredPowerLines.map((line) => (
            <Polyline
              key={line.id}
              path={line.path}
              options={getLineOptions(line)}
              onClick={() => {
                setSelectedLine(line)
                setSelectedTransformer(null)
              }}
            />
          ))}

          {/* Render transformers */}
          {filteredTransformers.map((transformer) => (
            <Marker
              key={transformer.id}
              position={transformer.position}
              icon={getTransformerIcon(transformer)}
              onClick={() => {
                setSelectedTransformer(transformer)
                setSelectedLine(null)
              }}
            />
          ))}

          {/* Add circles for active transformers to show their coverage area */}
          {filteredTransformers
            .filter((t) => powerStatus[t.id]?.active)
            .map((transformer) => (
              <Circle
                key={`circle-${transformer.id}`}
                center={transformer.position}
                radius={transformer.capacity > 500 ? 300 : 150}
                options={{
                  strokeColor: "#4CAF50",
                  strokeOpacity: 0.2,
                  strokeWeight: 1,
                  fillColor: "#4CAF50",
                  fillOpacity: 0.1,
                  clickable: false,
                }}
              />
            ))}

          {/* Power line info window */}
          {selectedLine && (
            <InfoWindow
              position={{
                lat: selectedLine.path[Math.floor(selectedLine.path.length / 2)].lat,
                lng: selectedLine.path[Math.floor(selectedLine.path.length / 2)].lng,
              }}
              onCloseClick={() => setSelectedLine(null)}
            >
              <div className="p-2 max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Bolt className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-lg">{selectedLine.name}</h3>
                </div>

                <div className="mb-2">
                  <Badge
                    variant={powerStatus[selectedLine.id]?.active ? "default" : "secondary"}
                    className={
                      powerStatus[selectedLine.id]?.active
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-200 text-gray-700"
                    }
                  >
                    {powerStatus[selectedLine.id]?.active ? (
                      <span className="flex items-center gap-1">
                        <Power className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <PowerOff className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <Badge variant="outline">{selectedLine.type}</Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Voltage:</span>
                    <span>{powerStatus[selectedLine.id]?.voltage || "N/A"} kV</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Load:</span>
                    <span className={getLoadClass(powerStatus[selectedLine.id]?.load)}>
                      {powerStatus[selectedLine.id]?.load || "N/A"} MW
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Area:</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {selectedLine.area}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="text-xs">
                      {powerStatus[selectedLine.id]?.lastUpdated
                        ? formatDate(powerStatus[selectedLine.id].lastUpdated)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Transformer info window */}
          {selectedTransformer && (
            <InfoWindow position={selectedTransformer.position} onCloseClick={() => setSelectedTransformer(null)}>
              <div className="p-2 max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <BatteryCharging className="h-5 w-5 text-green-600" />
                  <h3 className="font-bold text-lg">{selectedTransformer.name}</h3>
                </div>

                <div className="mb-2">
                  <Badge
                    variant={powerStatus[selectedTransformer.id]?.active ? "default" : "secondary"}
                    className={
                      powerStatus[selectedTransformer.id]?.active
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-200 text-gray-700"
                    }
                  >
                    {powerStatus[selectedTransformer.id]?.active ? (
                      <span className="flex items-center gap-1">
                        <Power className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <PowerOff className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacity:</span>
                    <span>{selectedTransformer.capacity} kVA</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Load:</span>
                    <span className={getLoadClass(powerStatus[selectedTransformer.id]?.load)}>
                      {powerStatus[selectedTransformer.id]?.load || "0"}%
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Address:</span>
                    <span className="text-right max-w-[150px]">{selectedTransformer.address}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Maintenance:</span>
                    <span>{selectedTransformer.lastMaintenance}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="text-xs">
                      {powerStatus[selectedTransformer.id]?.lastUpdated
                        ? formatDate(powerStatus[selectedTransformer.id].lastUpdated)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button variant="secondary" size="icon" onClick={handleZoomIn} className="h-8 w-8 shadow-md">
          <Maximize className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={handleZoomOut} className="h-8 w-8 shadow-md">
          <Minimize className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setMapType(mapType === "roadmap" ? "satellite" : "roadmap")}
          className="h-8 w-8 shadow-md"
        >
          <Layers className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setShowLegend(!showLegend)}
          className="h-8 w-8 shadow-md"
        >
          {showLegend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {/* Search Panel */}
      <div className="absolute top-4 left-4 z-10 w-80">
        <Card className="shadow-lg">
          <CardHeader className="p-3">
            <CardTitle className="text-md flex items-center gap-2">
              <Compass className="h-4 w-4" />
              Lagos Power Grid Explorer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            <div className="flex gap-2">
              <Input
                type="search"
                placeholder="Search power lines or transformers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-9"
              />
              <Button variant="default" size="sm" onClick={handleSearch} className="h-9">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="text-xs h-8">
                <Filter className="h-3 w-3 mr-1" />
                Filters
              </Button>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {alerts > 0 && (
                  <Badge variant="destructive" className="h-5 text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {alerts} {alerts === 1 ? "Alert" : "Alerts"}
                  </Badge>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="bg-muted/50 p-2 rounded-md space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showTransmissionLines"
                      checked={filters.showTransmissionLines}
                      onCheckedChange={() => toggleFilter("showTransmissionLines")}
                    />
                    <Label htmlFor="showTransmissionLines" className="text-xs">
                      Transmission Lines
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showDistributionLines"
                      checked={filters.showDistributionLines}
                      onCheckedChange={() => toggleFilter("showDistributionLines")}
                    />
                    <Label htmlFor="showDistributionLines" className="text-xs">
                      Distribution Lines
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showStreetLines"
                      checked={filters.showStreetLines}
                      onCheckedChange={() => toggleFilter("showStreetLines")}
                    />
                    <Label htmlFor="showStreetLines" className="text-xs">
                      Street Lines
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showActiveLines"
                      checked={filters.showActiveLines}
                      onCheckedChange={() => toggleFilter("showActiveLines")}
                    />
                    <Label htmlFor="showActiveLines" className="text-xs">
                      Active Lines
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showInactiveLines"
                      checked={filters.showInactiveLines}
                      onCheckedChange={() => toggleFilter("showInactiveLines")}
                    />
                    <Label htmlFor="showInactiveLines" className="text-xs">
                      Inactive Lines
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showActiveTransformers"
                      checked={filters.showActiveTransformers}
                      onCheckedChange={() => toggleFilter("showActiveTransformers")}
                    />
                    <Label htmlFor="showActiveTransformers" className="text-xs">
                      Active Transformers
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showInactiveTransformers"
                      checked={filters.showInactiveTransformers}
                      onCheckedChange={() => toggleFilter("showInactiveTransformers")}
                    />
                    <Label htmlFor="showInactiveTransformers" className="text-xs">
                      Inactive Transformers
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto border rounded-md">
                <div className="p-2 bg-muted text-xs font-medium">Search Results ({searchResults.length})</div>
                <div className="divide-y">
                  {searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="p-2 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{result.name}</div>
                        <Badge variant={result.status === "Active" ? "default" : "secondary"} className="text-xs h-5">
                          {result.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {result.type}: {result.subtype}
                        </span>
                        <span>{result.area}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-3 pt-0 flex justify-between text-xs text-muted-foreground">
            <div>
              <span className="font-medium">{activeLines}</span>/{powerLines.length} Lines Active
            </div>
            <div>
              <span className="font-medium">{activeTransformers}</span>/{transformers.length} Transformers Active
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 z-10">
          <Card className="shadow-lg">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm">Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-2">
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-[#FFD700]"></div>
                  <span>Transmission Line (Active)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-[#4CAF50]"></div>
                  <span>Distribution Line (Active)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-[#2196F3]"></div>
                  <span>Street Distribution (Active)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-[#555555] opacity-60"></div>
                  <span>Inactive Line</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#4CAF50] border border-black"></div>
                  <span>Transformer (Low Load)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#FFC107] border border-black"></div>
                  <span>Transformer (Medium Load)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#FF5252] border border-black"></div>
                  <span>Transformer (High Load)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#555555] border border-black"></div>
                  <span>Inactive Transformer</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PowerMap

