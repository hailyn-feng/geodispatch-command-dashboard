import { useState, useCallback, useMemo, useEffect } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl, Source, Layer } from 'react-map-gl'
import { useStore } from '@/store/useStore'
import { MapPin, Clock, AlertCircle, Users, Route, Filter, ZoomIn, ZoomOut, Maximize2, Minimize2, Crosshair, Map as MapIcon, Layers, Info, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import CustomSelect from '@/components/CustomSelect'
import type { WorkOrder, Technician } from '@/types'
import type { LineLayer } from 'react-map-gl'
import { MAPBOX_TOKEN, validateMapboxToken, createSafeViewport } from '@/config/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

// Custom Avatar Marker Component - Avatar sits ON TOP of pin
const AvatarMarker = ({ 
  tech, 
  isSelected, 
  onClick 
}: { 
  tech: Technician
  isSelected: boolean
  onClick: () => void 
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all duration-300",
        isSelected ? "z-50" : "z-10"
      )}
      style={{ transform: 'translateY(-50%)' }}
    >
      {/* Avatar on top - smaller size */}
      <div className={cn(
        "relative w-10 h-10 rounded-full overflow-hidden border-3 shadow-xl transition-all bg-white",
        isSelected 
          ? "border-blue-500 ring-4 ring-blue-300 scale-125 animate-bounce" 
          : "border-white ring-2 ring-gray-300 hover:scale-110 hover:shadow-xl"
      )}>
        <img
          src={tech.avatar}
          alt={tech.name}
          className="w-full h-full object-cover"
        />
        {/* Status indicator */}
        <div className={cn(
          'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-md',
          tech.status === 'available' && 'bg-green-500',
          tech.status === 'busy' && 'bg-yellow-500',
          tech.status === 'on-break' && 'bg-orange-500',
          tech.status === 'offline' && 'bg-gray-400'
        )} />
      </div>
      
      {/* Pin pointer below avatar - smaller size */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5">
        <div className={cn(
          "w-0 h-0 transition-all",
          "border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px]",
          isSelected ? "border-t-blue-500" : "border-t-gray-500"
        )} />
      </div>
      
      {/* Name label */}
      {isSelected && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xl animate-fadeIn">
          {tech.name}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-blue-600" />
        </div>
      )}
    </div>
  )
}

// Work Order Marker Component
const OrderMarker = ({ 
  order, 
  isSelected, 
  onClick 
}: { 
  order: WorkOrder
  isSelected: boolean
  onClick: () => void 
}) => {
  const statusColors = {
    pending: 'bg-yellow-500 ring-yellow-300',
    assigned: 'bg-blue-500 ring-blue-300',
    'in-progress': 'bg-purple-500 ring-purple-300',
    completed: 'bg-green-500 ring-green-300',
    cancelled: 'bg-gray-400 ring-gray-300'
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all duration-300",
        isSelected && "z-40 animate-pulse"
      )}
    >
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white",
        statusColors[order.status].split(' ')[0],
        isSelected && `ring-4 scale-125 ${statusColors[order.status].split(' ')[1]}`
      )}>
        <MapPin className="h-4 w-4 drop-shadow-lg" fill="currentColor" />
      </div>
      {isSelected && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-gray-900 text-white px-2.5 py-1 rounded-lg text-xs font-medium shadow-xl">
          #{order.id}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-gray-900" />
        </div>
      )}
    </div>
  )
}

export default function MapDispatch() {
  const { workOrders, technicians, assignTechnician } = useStore()
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null)
  const [draggedOrder, setDraggedOrder] = useState<WorkOrder | null>(null)
  const [hoveredTechId, setHoveredTechId] = useState<string | null>(null)
  const [showRoutes, setShowRoutes] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'busy'>('all')
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('streets')
  const [is3D, setIs3D] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  // Validate Mapbox token on component mount
  useEffect(() => {
    validateMapboxToken()
  }, [])

  const [viewport, setViewport] = useState(createSafeViewport({
    latitude: 40.7580,
    longitude: -73.9855,
    zoom: 12,
    pitch: 0,
    bearing: 0,
  }))

  const pendingOrders = workOrders.filter(o => o.status === 'pending' || o.status === 'assigned')
  const availableTechs = technicians.filter(t => {
    if (filterStatus === 'all') return t.status === 'available' || t.status === 'busy'
    if (filterStatus === 'available') return t.status === 'available'
    if (filterStatus === 'busy') return t.status === 'busy'
    return false
  })

  // Generate route line between tech and order
  const routeData = useMemo(() => {
    if (!showRoutes || !selectedTech || !selectedOrder) return null
    
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [selectedTech.currentLocation.lng, selectedTech.currentLocation.lat],
          [selectedOrder.location.lng, selectedOrder.location.lat]
        ]
      }
    }
  }, [showRoutes, selectedTech, selectedOrder])

  const routeLayer: LineLayer = {
    id: 'route',
    type: 'line',
    source: 'route',
    paint: {
      'line-color': '#3b82f6',
      'line-width': 5,
      'line-opacity': 0.9,
    }
  }

  // Route animation layer
  const routeAnimationLayer: LineLayer = {
    id: 'route-animation',
    type: 'line',
    source: 'route',
    paint: {
      'line-color': '#60a5fa',
      'line-width': 3,
      'line-opacity': 0.6,
      'line-dasharray': [2, 4]
    }
  }

  // Calculate distance
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return (R * c).toFixed(2)
  }

  const handleAssign = useCallback((order: WorkOrder, tech: Technician) => {
    assignTechnician(order.id, tech.id)
    setDraggedOrder(null)
    setSelectedOrder(null)
    setHoveredTechId(null)
    setSelectedTech(tech)
    setTimeout(() => setSelectedTech(null), 2000)
  }, [assignTechnician])

  const handleDrop = (tech: Technician) => {
    if (draggedOrder) {
      handleAssign(draggedOrder, tech)
    }
  }

  const handleFocusOnTech = (tech: Technician) => {
    setViewport({
      ...viewport,
      latitude: tech.currentLocation.lat,
      longitude: tech.currentLocation.lng,
      zoom: 16, // Higher zoom level for better detail
    })
    setSelectedTech(tech)
    setSelectedOrder(null)
  }

  const handleFocusOnOrder = (order: WorkOrder) => {
    setViewport({
      ...viewport,
      latitude: order.location.lat,
      longitude: order.location.lng,
      zoom: 16, // Higher zoom level for better detail
    })
    setSelectedOrder(order)
  }

  const handleShowRoute = (order: WorkOrder, tech: Technician) => {
    setSelectedOrder(order)
    setSelectedTech(tech)
    setShowRoutes(true)
    
    const centerLng = (tech.currentLocation.lng + order.location.lng) / 2
    const centerLat = (tech.currentLocation.lat + order.location.lat) / 2
    setViewport({
      ...viewport,
      latitude: centerLat,
      longitude: centerLng,
      zoom: 13,
    })
  }

  const toggleMapStyle = () => {
    const styles = ['streets', 'satellite', 'dark'] as const
    const currentIndex = styles.indexOf(mapStyle)
    const nextIndex = (currentIndex + 1) % styles.length
    setMapStyle(styles[nextIndex])
  }

  const toggle3DView = () => {
    setIs3D(!is3D)
    setViewport({
      ...viewport,
      pitch: !is3D ? 60 : 0,
      bearing: !is3D ? -17.6 : 0,
    })
  }

  const mapStyleUrls = {
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    dark: 'mapbox://styles/mapbox/dark-v11'
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Page Header */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Map Dispatch</h1>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className={cn(
                "p-2 rounded-lg border transition-all",
                showGuide 
                  ? "bg-blue-500 text-white border-blue-600" 
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              title="Toggle User Guide"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time technician tracking with drag-and-drop assignment and route optimization
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <CustomSelect
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as any)}
              options={[
                { value: 'all', label: 'All Technicians' },
                { value: 'available', label: 'Available Only' },
                { value: 'busy', label: 'Busy Only' }
              ]}
              className="w-48"
            />
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-300 dark:border-gray-600">
            <button
              onClick={toggleMapStyle}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium shadow-sm hover:shadow flex items-center gap-2"
              title="Change Map Style"
            >
              <Layers className="h-4 w-4" />
              {mapStyle === 'streets' ? 'Streets' : mapStyle === 'satellite' ? 'Satellite' : 'Dark'}
            </button>
            
            <button
              onClick={toggle3DView}
              className={cn(
                "p-2 rounded-lg border transition-all shadow-sm hover:shadow",
                is3D 
                  ? "bg-blue-500 text-white border-blue-600 hover:bg-blue-600" 
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              title="Toggle 3D View"
            >
              {is3D ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setShowRoutes(!showRoutes)}
              className={cn(
                "p-2 rounded-lg border transition-all shadow-sm hover:shadow",
                showRoutes 
                  ? "bg-blue-500 text-white border-blue-600 hover:bg-blue-600" 
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              title="Show Routes"
            >
              <Route className="h-4 w-4" />
            </button>

            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Guide Panel */}
      {showGuide && (
        <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Info className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">How to Use Map Dispatch</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quick guide to master this powerful tool</p>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <ChevronUp className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">1</div>
                <h4 className="font-bold text-gray-900 dark:text-white">View Orders</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span><strong>Left panel</strong> shows pending work orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span><strong>Click</strong> any order to zoom to its location</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span><strong>Green badge</strong> shows assigned technician</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">2</div>
                <h4 className="font-bold text-gray-900 dark:text-white">Drag & Assign</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span><strong>Drag</strong> an order card from left panel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span><strong>Drop</strong> it on a technician card (right panel)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span><strong>Distance</strong> is calculated automatically</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">3</div>
                <h4 className="font-bold text-gray-900 dark:text-white">Map Controls</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span><strong>Avatar markers</strong> = Technicians</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span><strong>Pin markers</strong> = Work order locations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span><strong>Click markers</strong> to see details & zoom in</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">4</div>
                <h4 className="font-bold text-gray-900 dark:text-white">Route Planning</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
                  <span><strong>Select</strong> an order and a technician</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
                  <span><strong>Click "Show Route"</strong> button</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
                  <span><strong>Blue line</strong> shows the path + distance</span>
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold">5</div>
                <h4 className="font-bold text-gray-900 dark:text-white">Map Styles</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  <span><strong>Streets</strong> - Standard road map view</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  <span><strong>Satellite</strong> - Real aerial imagery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  <span><strong>Dark</strong> - Night-friendly mode</span>
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold">6</div>
                <h4 className="font-bold text-gray-900 dark:text-white">3D View</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500">•</span>
                  <span><strong>Toggle</strong> 3D button for tilted view</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500">•</span>
                  <span><strong>See buildings</strong> in 3D perspective</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500">•</span>
                  <span><strong>Better</strong> spatial understanding</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Available</strong></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span><strong>Busy</strong></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span><strong>Urgent Priority</strong></span>
              </div>
              <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                💡 <strong>Tip:</strong> Filter technicians by status using the dropdown above
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={cn(
        "grid grid-cols-1 lg:grid-cols-[320px,1fr,320px] gap-4",
        showGuide ? "h-[calc(100%-30rem)]" : "h-[calc(100%-5rem)]"
      )}>
        {/* Work Orders Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 overflow-y-auto border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div>Pending Orders</div>
              <div className="text-xs font-normal text-gray-500">Drag to assign</div>
            </div>
            <span className="ml-auto px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-bold rounded-full">
              {pendingOrders.length}
            </span>
          </h2>
          
          {draggedOrder && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300 animate-pulse">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4" />
                <span className="font-semibold">Drop on technician card to assign</span>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                draggable
                onDragStart={() => setDraggedOrder(order)}
                onDragEnd={() => setDraggedOrder(null)}
                onClick={() => handleFocusOnOrder(order)}
                className={cn(
                  'p-3.5 rounded-xl border-2 transition-all cursor-move group',
                  selectedOrder?.id === order.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-md hover:scale-102 bg-white dark:bg-gray-750',
                  draggedOrder?.id === order.id && 'opacity-50 scale-95 rotate-2'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400">#{order.id}</span>
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                      {order.customer.name}
                    </p>
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm",
                    order.priority === 'urgent' && 'bg-red-500 text-white animate-pulse',
                    order.priority === 'high' && 'bg-orange-500 text-white',
                    order.priority === 'medium' && 'bg-orange-500 text-white',
                    order.priority === 'low' && 'bg-gray-400 text-white'
                  )}>
                    {order.priority.toUpperCase()}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed">
                  {order.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(order.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>

                {/* Show assigned technician */}
                {order.technician && (
                  <div className="mt-2 mb-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img
                        src={order.technician.avatar}
                        alt={order.technician.name}
                        className="w-5 h-5 rounded-full border-2 border-green-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 truncate">
                          Assigned to: {order.technician.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTech && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs bg-blue-50 dark:bg-blue-900/20 px-2 py-1.5 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Distance:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Route className="h-3 w-3" />
                        {calculateDistance(
                          selectedTech.currentLocation.lat,
                          selectedTech.currentLocation.lng,
                          order.location.lat,
                          order.location.lng
                        )} km
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <Map
            {...viewport}
            onMove={evt => setViewport(evt.viewState)}
            mapStyle={mapStyleUrls[mapStyle]}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
            attributionControl={false}
            interactiveLayerIds={[]}
          >
            <NavigationControl position="top-right" style={{ top: 10, right: 10 }} />
            <GeolocateControl position="top-right" style={{ top: 90, right: 10 }} />

            {/* Technician Markers - Avatar on Pin */}
            {availableTechs.map((tech) => (
              <Marker
                key={tech.id}
                latitude={tech.currentLocation.lat}
                longitude={tech.currentLocation.lng}
                anchor="bottom"
              >
                <AvatarMarker
                  tech={tech}
                  isSelected={selectedTech?.id === tech.id}
                  onClick={() => handleFocusOnTech(tech)}
                />
              </Marker>
            ))}

            {/* Work Order Markers */}
            {pendingOrders.map((order) => (
              <Marker
                key={order.id}
                latitude={order.location.lat}
                longitude={order.location.lng}
                anchor="center"
              >
                <OrderMarker
                  order={order}
                  isSelected={selectedOrder?.id === order.id}
                  onClick={() => handleFocusOnOrder(order)}
                />
              </Marker>
            ))}

            {/* Route Lines */}
            {routeData && (
              <>
                <Source id="route" type="geojson" data={routeData as any}>
                  <Layer {...routeLayer} />
                </Source>
                <Source id="route-animation" type="geojson" data={routeData as any}>
                  <Layer {...routeAnimationLayer} />
                </Source>
              </>
            )}
          </Map>

          {/* Map Overlay Stats */}
          <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl p-4 space-y-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{availableTechs.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Techs</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{pendingOrders.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Pending Jobs</div>
              </div>
            </div>
            {showRoutes && selectedTech && selectedOrder && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Route className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {calculateDistance(
                        selectedTech.currentLocation.lat,
                        selectedTech.currentLocation.lng,
                        selectedOrder.location.lat,
                        selectedOrder.location.lng
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">km distance</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            <button
              onClick={() => setViewport({ ...viewport, zoom: Math.min(viewport.zoom + 1, 20) })}
              className="p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 hover:scale-110"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setViewport({ ...viewport, zoom: Math.max(viewport.zoom - 1, 1) })}
              className="p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 hover:scale-110"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setViewport({ latitude: 40.7580, longitude: -73.9855, zoom: 12, pitch: 0, bearing: 0 })}
              className="p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 hover:scale-110"
              title="Reset View"
            >
              <Crosshair className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Map Style Indicator */}
          <div className="absolute bottom-4 right-4 px-3 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <MapIcon className="h-3 w-3 inline mr-1" />
            {is3D && '3D '}
            {mapStyle.charAt(0).toUpperCase() + mapStyle.slice(1)}
          </div>
        </div>

        {/* Technicians Panel - Enhanced with Drag & Drop */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 overflow-y-auto border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div>Technicians</div>
              <div className="text-xs font-normal text-gray-500">Click to view</div>
            </div>
            <span className="ml-auto px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-bold rounded-full">
              {availableTechs.length}
            </span>
          </h2>
          
          {draggedOrder && (
            <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-300 animate-pulse">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-semibold">Ready to receive order</span>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {availableTechs.map((tech) => (
              <div
                key={tech.id}
                onDragOver={(e) => {
                  e.preventDefault()
                  setHoveredTechId(tech.id)
                }}
                onDragLeave={() => setHoveredTechId(null)}
                onDrop={() => handleDrop(tech)}
                onClick={() => handleFocusOnTech(tech)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden group',
                  selectedTech?.id === tech.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md bg-white dark:bg-gray-750',
                  hoveredTechId === tech.id && draggedOrder && 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-105 shadow-xl ring-4 ring-green-300',
                  tech.status === 'available' && 'hover:shadow-lg'
                )}
              >
                {/* Drop indicator */}
                {hoveredTechId === tech.id && draggedOrder && (
                  <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-10 animate-pulse">
                    <div className="bg-green-600 text-white px-4 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 scale-110">
                      <Route className="h-5 w-5" />
                      Drop to Assign
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="w-14 h-14 rounded-full ring-4 ring-white dark:ring-gray-700 shadow-lg object-cover"
                    />
                    <div className={cn(
                      'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white dark:border-gray-800 shadow-lg',
                      tech.status === 'available' && 'bg-green-500',
                      tech.status === 'busy' && 'bg-yellow-500',
                      tech.status === 'on-break' && 'bg-orange-500',
                      tech.status === 'offline' && 'bg-gray-400'
                    )} />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                        {tech.name}
                      </p>
                      <div className="flex items-center gap-1 text-yellow-500 text-xs font-semibold">
                        ⭐ {tech.rating}
                      </div>
                    </div>
                    
                    <p className={cn(
                      "text-xs font-bold capitalize mb-3 flex items-center gap-1",
                      tech.status === 'available' && 'text-green-600 dark:text-green-400',
                      tech.status === 'busy' && 'text-yellow-600 dark:text-yellow-400',
                      tech.status === 'on-break' && 'text-orange-600 dark:text-orange-400',
                      tech.status === 'offline' && 'text-gray-500'
                    )}>
                      {tech.status === 'available' ? '✓ Available' : 
                       tech.status === 'busy' ? '⚡ Busy' : 
                       tech.status === 'on-break' ? '☕ On Break' : '⊗ Offline'}
                    </p>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2 py-1.5">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Assigned</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{tech.assignedOrders}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2 py-1.5">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Completed</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{tech.completedToday}</div>
                      </div>
                    </div>
                    
                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {tech.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-lg font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    {/* Quick Actions */}
                    {selectedOrder && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShowRoute(selectedOrder, tech)
                        }}
                        className="mt-2 w-full py-2 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <Route className="h-3.5 w-3.5" />
                        Show Route to Selected Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
