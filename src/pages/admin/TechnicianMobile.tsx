import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import Map, { Marker, NavigationControl } from 'react-map-gl'
import { 
  MapPin, 
  Clock, 
  Phone, 
  Navigation as NavigationIcon, 
  CheckCircle,
  Camera,
  Edit3,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils'
import { MAPBOX_TOKEN, validateMapboxToken, createSafeViewport } from '@/config/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

export default function TechnicianMobile() {
  const { workOrders, technicians, updateWorkOrder, currentUser } = useStore()
  const [selectedTab, setSelectedTab] = useState<'today' | 'nearby' | 'history'>('today')
  
  // Validate Mapbox token on component mount
  useEffect(() => {
    validateMapboxToken()
  }, [])
  
  // 根据当前用户获取对应的技术员信息
  const currentTech = technicians.find(t => t.id === currentUser.technicianId) || technicians[0]
  
  // 获取当前技术员的工单（已经通过 store 过滤）
  const myOrders = workOrders
  const todayOrders = myOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled')
  const completedOrders = myOrders.filter(o => o.status === 'completed')

  const [viewport, setViewport] = useState(createSafeViewport({
    latitude: currentTech?.currentLocation?.lat,
    longitude: currentTech?.currentLocation?.lng,
    zoom: 13,
  }))

  const handleStartWork = (orderId: string) => {
    updateWorkOrder(orderId, { status: 'in-progress' })
  }

  const handleCompleteWork = (orderId: string) => {
    updateWorkOrder(orderId, { 
      status: 'completed',
      completedDate: new Date().toISOString(),
      actualDuration: 90
    })
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={currentTech.avatar}
            alt={currentTech.name}
            className="w-12 h-12 rounded-full border-2 border-white"
          />
          <div>
            <h2 className="font-semibold">{currentTech.name}</h2>
            <p className="text-xs text-blue-100">Technician ID: {currentTech.id}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-xl font-bold">{todayOrders.length}</div>
            <div className="text-xs">Today</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-xl font-bold">{completedOrders.length}</div>
            <div className="text-xs">Completed</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-xl font-bold">{currentTech.rating}</div>
            <div className="text-xs">Rating</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700">
        {[
          { id: 'today', label: 'Today', count: todayOrders.length },
          { id: 'nearby', label: 'Nearby', count: 0 },
          { id: 'history', label: 'History', count: completedOrders.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
              selectedTab === tab.id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {tab.label} ({tab.count})
            {selectedTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {selectedTab === 'today' && (
          <div className="space-y-4">
            {todayOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pending tasks for today</p>
              </div>
            ) : (
              todayOrders.map((order) => (
                <div
                  key={order.id}
                  className="border dark:border-gray-700 rounded-lg p-4 space-y-3"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {order.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {order.category}
                      </p>
                    </div>
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded',
                      order.priority === 'urgent' && 'bg-red-100 text-red-800',
                      order.priority === 'high' && 'bg-orange-100 text-orange-800',
                      order.priority === 'medium' && 'bg-yellow-100 text-yellow-800',
                      order.priority === 'low' && 'bg-gray-100 text-gray-800'
                    )}>
                      {order.priority === 'urgent' ? 'Urgent' : 
                       order.priority === 'high' ? 'High' :
                       order.priority === 'medium' ? 'Medium' : 'Low'}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {order.customer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`tel:${order.customer.phone}`}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        {order.customer.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      Est. {order.estimatedDuration} min • {formatTime(order.scheduledDate)}
                    </div>
                  </div>

                  {/* Map Preview */}
                  <div className="h-32 rounded-lg overflow-hidden">
                    <Map
                      latitude={order.location.lat}
                      longitude={order.location.lng}
                      zoom={14}
                      mapStyle="mapbox://styles/mapbox/streets-v12"
                      mapboxAccessToken={MAPBOX_TOKEN}
                      interactive={false}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <Marker
                        latitude={order.location.lat}
                        longitude={order.location.lng}
                      >
                        <MapPin className="h-6 w-6 text-red-500" />
                      </Marker>
                    </Map>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${order.location.lat},${order.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <NavigationIcon className="h-4 w-4" />
                      Navigate
                    </a>
                    {order.status === 'assigned' && (
                      <button
                        onClick={() => handleStartWork(order.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Start Work
                      </button>
                    )}
                    {order.status === 'in-progress' && (
                      <button
                        onClick={() => handleCompleteWork(order.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Complete
                      </button>
                    )}
                  </div>

                  {/* Quick Actions */}
                  {order.status === 'in-progress' && (
                    <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        <Camera className="h-4 w-4" />
                        Photo
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        <Edit3 className="h-4 w-4" />
                        Notes
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'nearby' && (
          <div className="h-96">
            <Map
              {...viewport}
              onMove={evt => setViewport(evt.viewState)}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: '100%', height: '100%' }}
            >
              <NavigationControl position="top-right" />
              
              {/* Current Location */}
              <Marker
                latitude={currentTech.currentLocation.lat}
                longitude={currentTech.currentLocation.lng}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-4 border-blue-500 overflow-hidden">
                    <img src={currentTech.avatar} alt="Me" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                </div>
              </Marker>

              {/* Nearby Orders */}
              {todayOrders.map((order) => (
                <Marker
                  key={order.id}
                  latitude={order.location.lat}
                  longitude={order.location.lng}
                >
                  <MapPin className="h-6 w-6 text-red-500" />
                </Marker>
              ))}
            </Map>
          </div>
        )}

        {selectedTab === 'history' && (
          <div className="space-y-3">
            {completedOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No history records</p>
              </div>
            ) : (
              completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="border dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {order.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.customer.name}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  {order.completedDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Completed: {formatTime(order.completedDate)}
                    </p>
                  )}
                  {order.rating && (
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium">{order.rating}/5</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
