import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Map, { Marker, Source, Layer } from 'react-map-gl'
import { useStore } from '@/store/useStore'
import { Play, Pause, RotateCcw, X, MapPin, AlertTriangle, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateMassWorkOrders } from '@/utils/generateMassData'
import Supercluster from 'supercluster'
import { LeftPanel } from '@/components/screen/LeftPanel'
import { RightPanel } from '@/components/screen/RightPanel'
import { MapLegend } from '@/components/screen/MapLegend'
import { generateVehicleTrajectory } from '@/utils/trajectoryGenerator'
import { MAPBOX_TOKEN, validateMapboxToken, createSafeViewport } from '@/config/mapbox'

type ClusterProperties = {
  cluster: boolean
  point_count?: number
  technicianId?: string
  licensePlate?: string
}

// 告警数据类型
interface Alert {
  id: string
  type: 'emergency' | 'urgent' | 'warning'
  title: string
  location: { lat: number; lng: number; address: string }
  time: string
  status: 'active' | 'acknowledged'
}

// 生成告警数据 - 优化为更真实的场景
const generateAlerts = (): Alert[] => [
  {
    id: 'alert-1',
    type: 'emergency',
    title: 'HVAC System Failure - Data Center',
    location: { lat: 40.7489, lng: -73.9680, address: '11 E 44th St, Manhattan' },
    time: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'alert-2',
    type: 'urgent',
    title: 'Gas Leak Detected - Restaurant',
    location: { lat: 40.7614, lng: -73.9776, address: '247 W 46th St, Manhattan' },
    time: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'alert-3',
    type: 'warning',
    title: 'Elevator Malfunction - Office Building',
    location: { lat: 40.7128, lng: -74.0134, address: '1 World Trade Center' },
    time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'acknowledged',
  },
]

interface DisplayMapProps {
  isPageVisible: boolean
}

export default function DisplayMap({ isPageVisible }: DisplayMapProps) {
  const { workOrders, technicians } = useStore()
  const mapRef = useRef<any>(null)
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [hoveredCluster, setHoveredCluster] = useState<any>(null)
  
  // Validate Mapbox token on component mount
  useEffect(() => {
    validateMapboxToken()
  }, [])
  
  // 侧边栏展开/收起状态
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  // 告警数据和面板状态
  const [alerts, setAlerts] = useState<Alert[]>(generateAlerts())
  const [alertPanelOpen, setAlertPanelOpen] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null) // 默认不选中任何告警
  const [isAlertPushEnabled, setIsAlertPushEnabled] = useState(true) // 控制推送开关
  
  // 热力图状态
  const [showHeatmap, setShowHeatmap] = useState(false)
  
  // 告警数字动画状态
  const [alertCountChange, setAlertCountChange] = useState<number>(0) // +1, -1, or 0
  const [prevAlertCount, setPrevAlertCount] = useState(alerts.filter(a => a.status === 'active').length)

  // 车辆轨迹动画状态
  const [vehicleTrajectory, setVehicleTrajectory] = useState<Array<{ lat: number; lng: number; time: string; speed: number }>>([])
  const [trajectoryAnimationIndex, setTrajectoryAnimationIndex] = useState(0)
  const [isTrajectoryPlaying, setIsTrajectoryPlaying] = useState(true)

  // 保留旧的轨迹回放状态（用于其他功能）
  const [playbackMode, setPlaybackMode] = useState(false)
  const [playbackVehicle, setPlaybackVehicle] = useState<string | null>(null)
  const [playbackIndex, setPlaybackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trajectoryData, setTrajectoryData] = useState<[number, number][]>([])

  // 生成车辆数据（优化：使用useMemo缓存，真实的车牌号和位置）
  const mockVehicles = useMemo(() => {
    return [
      {
        id: 'vehicle-0',
        licensePlate: 'GEO-2547',
        status: 'active' as const,
        currentLocation: 'Times Square',
        mileageToday: 87,
        assignedTech: 'Michael Chen',
        gps: { lat: 40.7580, lng: -73.9855 },
      },
      {
        id: 'vehicle-1',
        licensePlate: 'GEO-3891',
        status: 'active' as const,
        currentLocation: 'Financial District',
        mileageToday: 142,
        assignedTech: 'Sarah Williams',
        gps: { lat: 40.7074, lng: -74.0113 },
      },
      {
        id: 'vehicle-2',
        licensePlate: 'GEO-4206',
        status: 'active' as const,
        currentLocation: 'Upper East Side',
        mileageToday: 65,
        assignedTech: 'David Rodriguez',
        gps: { lat: 40.7736, lng: -73.9566 },
      },
      {
        id: 'vehicle-3',
        licensePlate: 'GEO-5128',
        status: 'idle' as const,
        currentLocation: 'Brooklyn Heights',
        mileageToday: 38,
        assignedTech: undefined,
        gps: { lat: 40.6958, lng: -73.9961 },
      },
      {
        id: 'vehicle-4',
        licensePlate: 'GEO-6734',
        status: 'maintenance' as const,
        currentLocation: 'Service Center',
        mileageToday: 0,
        assignedTech: undefined,
        gps: { lat: 40.7282, lng: -73.9942 },
      },
    ]
  }, [])

  // 车辆数据已固定，无需定时更新

  // 优化：车辆轨迹动画循环播放 - 降低频率，增加页面可见性控制
  useEffect(() => {
    if (!isPageVisible || !isTrajectoryPlaying || vehicleTrajectory.length === 0) return
    
    const interval = setInterval(() => {
      setTrajectoryAnimationIndex(prev => {
        const next = prev + 1
        if (next >= vehicleTrajectory.length) return 0
        return next
      })
    }, 3000) // 从2000ms改为3000ms，降低动画频率
    
    return () => clearInterval(interval)
  }, [isPageVisible, isTrajectoryPlaying, vehicleTrajectory.length])

  // 优化版：告警推送使用固定池子循环，推送20条后自动停止，增加页面可见性控制
  useEffect(() => {
    if (!isPageVisible || !isAlertPushEnabled) return

    // 预生成告警池（只生成一次）- 更真实的场景
    const alertPool = Array.from({ length: 20 }, (_, i) => {
      const alertTypes: Array<'emergency' | 'urgent' | 'warning'> = ['emergency', 'urgent', 'warning']
      const alertTitles = [
        'HVAC System Failure', 'Plumbing Emergency', 'Electrical Outage',
        'Fire Alarm Triggered', 'Gas Line Issue', 'Water Main Break',
        'Elevator Stuck', 'AC Unit Breakdown', 'Heating System Down',
        'Security System Offline', 'Boiler Malfunction', 'Refrigeration Failure'
      ]
      const locations = ['Midtown Manhattan', 'Financial District', 'Upper West Side', 'SoHo', 'Tribeca', 'Chelsea', 'Brooklyn Heights', 'Long Island City']
      
      return {
        type: alertTypes[i % 3],
        title: `${alertTitles[i % alertTitles.length]} - ${locations[i % locations.length]}`,
        baseLocation: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.15,
          lng: -73.9855 + (Math.random() - 0.5) * 0.15,
        },
        address: `${Math.floor(Math.random() * 999) + 1} ${locations[i % locations.length].split(' ')[0]} Ave`
      }
    })

    let poolIndex = 0
    let pushCount = 0 // 记录已推送次数
    const MAX_PUSH_COUNT = 20 // 最多推送20条
    
    const interval = setInterval(() => {
      // 达到20条后自动停止推送
      if (pushCount >= MAX_PUSH_COUNT) {
        setIsAlertPushEnabled(false) // 自动关闭推送
        return
      }
      
      setAlerts(prev => {
        const template = alertPool[poolIndex]
        poolIndex = (poolIndex + 1) % 20 // 循环使用池子
        
        const newAlert: Alert = {
          id: `alert-${Date.now()}-${poolIndex}`,
          type: template.type,
          title: template.title,
          location: {
            lat: template.baseLocation.lat + (Math.random() - 0.5) * 0.01, // 小范围随机
            lng: template.baseLocation.lng + (Math.random() - 0.5) * 0.01,
            address: template.address
          },
          time: new Date().toISOString(),
          status: 'active'
        }
        
        pushCount++ // 增加计数
        
        // FIFO队列：保持最新20条告警
        return prev.length >= 20 
          ? [newAlert, ...prev.slice(0, 19)] 
          : [newAlert, ...prev]
      })
    }, 4000) // 从3000ms改为4000ms，降低推送频率

    return () => clearInterval(interval)
  }, [isPageVisible, isAlertPushEnabled])

  // 监听告警数量变化，触发动画效果
  useEffect(() => {
    const currentCount = alerts.filter(a => a.status === 'active').length
    if (currentCount > prevAlertCount) {
      setAlertCountChange(1) // 增加
    } else if (currentCount < prevAlertCount) {
      setAlertCountChange(-1) // 减少
    }
    setPrevAlertCount(currentCount)
    
    // 2秒后重置动画
    const timer = setTimeout(() => setAlertCountChange(0), 2000)
    return () => clearTimeout(timer)
  }, [alerts.length, alerts])

  const [viewport, setViewport] = useState(createSafeViewport({
    latitude: 40.7580,
    longitude: -73.9855,
    zoom: 10,
  }))

  // 优化：使用useMemo缓存工单数据
  const massOrders = useMemo(() => 
    generateMassWorkOrders(1000, technicians),
    [technicians]
  )

  // 页面挂载时初始化：不自动选中任何技术员，保持总览视角
  useEffect(() => {
    // 移除自动选择逻辑，让用户手动选择
    // 保持 selectedTech 为 null，显示总览状态
  }, [])

  // 页面挂载时初始化：不自动选中任何车辆，但展示第一个车辆的轨迹动画
  useEffect(() => {
    // 不选中车辆（selectedVehicle 保持 null），但生成轨迹用于展示效果
    if (mockVehicles.length > 0 && vehicleTrajectory.length === 0) {
      const firstVehicle = mockVehicles[0]
      
      // 生成第一个车辆的轨迹用于动画展示
      const trajectory = generateVehicleTrajectory(
        firstVehicle.id,
        firstVehicle.licensePlate,
        firstVehicle.gps.lat,
        firstVehicle.gps.lng,
        50
      )
      
      setVehicleTrajectory(trajectory)
      setTrajectoryAnimationIndex(0)
      setIsTrajectoryPlaying(true)
      // 注意：不设置 selectedVehicle，保持为 null
    }
  }, [mockVehicles, vehicleTrajectory.length])

  // 工单位置不再动态更新，保持静态以提升性能

  // 轨迹回放动画，增加页面可见性控制
  useEffect(() => {
    if (!isPageVisible || !isPlaying || playbackIndex >= trajectoryData.length - 1) {
      setIsPlaying(false)
      return
    }

    const timer = setTimeout(() => {
      setPlaybackIndex(prev => prev + 1)
    }, 300) // 每300ms播放一帧

    return () => clearTimeout(timer)
  }, [isPageVisible, isPlaying, playbackIndex, trajectoryData])

  // 合并真实数据和模拟数据
  const allOrders = useMemo(() => {
    return [...workOrders, ...massOrders]
  }, [workOrders, massOrders])

  // 创建Supercluster实例
  const cluster = useMemo(() => {
    const supercluster = new Supercluster({
      radius: 80, // 聚合半径
      maxZoom: 16, // 提高最大聚合zoom到16，在更高缩放级别也保持聚合
      minZoom: 0,
      minPoints: 3, // 提高到3个点才聚合，避免不必要的小聚合
    })

    const points = allOrders.map(order => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        orderId: order.id,
        priority: order.priority,
        status: order.status,
        title: order.title,
        customer: order.customer.name,
        technician: order.technician?.name,
        technicianId: order.technician?.id,
        licensePlate: order.technician ? (order.technician as any).licensePlate || `V-${order.id.slice(-4)}` : `V-${order.id.slice(-4)}`,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [order.location.lng, order.location.lat],
      },
    }))

    supercluster.load(points)
    return supercluster
  }, [allOrders])

  // 优化：视图状态防抖，避免频繁重新计算聚类
  const [debouncedViewport, setDebouncedViewport] = useState(viewport)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedViewport(viewport)
    }, 150) // 150ms防抖
    
    return () => clearTimeout(timer)
  }, [viewport.latitude, viewport.longitude, viewport.zoom])

  // 获取当前视图的聚合点（使用防抖后的viewport）
  const clusteredPoints = useMemo(() => {
    if (!cluster) return []
    
    const bounds: [number, number, number, number] = [
      debouncedViewport.longitude - 1,
      debouncedViewport.latitude - 1,
      debouncedViewport.longitude + 1,
      debouncedViewport.latitude + 1,
    ]
    
    return cluster.getClusters(bounds, Math.floor(debouncedViewport.zoom))
  }, [cluster, debouncedViewport])

  // 点击技术人员联动（优化：使用useCallback避免重复创建）
  const handleTechClick = useCallback((tech: any) => {
    if (mapRef.current && tech.currentLocation) {
      mapRef.current.flyTo({
        center: [tech.currentLocation.lng, tech.currentLocation.lat],
        zoom: 11, // 从12降低到11，视野更宽
        duration: 700,
        essential: true
      })
      setSelectedTech(tech.id)
    }
  }, [])

  // 处理车辆点击（优化：分离状态更新和地图操作）
  const handleVehicleClick = useCallback((vehicleId: string) => {
    setSelectedVehicle(vehicleId)
  }, [])
  
  // 添加effect来处理选中车辆的地图飞行和轨迹
  useEffect(() => {
    if (selectedVehicle && mapRef.current) {
      const vehicle = mockVehicles.find(v => v.id === selectedVehicle)
      if (vehicle) {
        // 生成该车辆的轨迹数据
        const trajectory = generateVehicleTrajectory(
          selectedVehicle,
          vehicle.licensePlate,
          vehicle.gps.lat,
          vehicle.gps.lng,
          50
        )
        
        // 设置轨迹并开始播放
        setVehicleTrajectory(trajectory)
        setTrajectoryAnimationIndex(0)
        setIsTrajectoryPlaying(true)
        
        mapRef.current.flyTo({
          center: [vehicle.gps.lng, vehicle.gps.lat],
          zoom: 11, // 从12降低到11，视野更宽
          duration: 700,
          essential: true
        })
      }
    }
  }, [selectedVehicle, mockVehicles])

  // 处理告警点击（优化：使用ref获取最新数据）
  const handleAlertClick = useCallback((alertId: string) => {
    if (!mapRef.current) return
    
    setSelectedAlert(alertId)
  }, [])
  
  // 添加一个effect来处理选中告警的地图飞行
  useEffect(() => {
    if (selectedAlert && mapRef.current) {
      const alert = alerts.find(a => a.id === selectedAlert)
      if (alert) {
        mapRef.current.flyTo({
          center: [alert.location.lng, alert.location.lat],
          zoom: 13,
          duration: 700,
          essential: true
        })
      }
    }
  }, [selectedAlert, alerts])

  // 重置地图 - 刷新整个页面
  const handleResetMap = useCallback(() => {
    window.location.reload()
  }, [])

  // 点击聚合点展开
  const handleClusterClick = (clusterId: number, longitude: number, latitude: number) => {
    const expansionZoom = Math.min(cluster.getClusterExpansionZoom(clusterId), 20)
    
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: expansionZoom,
        duration: 800,
        essential: true
      })
    }
  }

  // 停止轨迹回放
  const stopPlayback = () => {
    setPlaybackMode(false)
    setPlaybackVehicle(null)
    setIsPlaying(false)
    setPlaybackIndex(0)
    setTrajectoryData([])
  }

  // 轨迹线GeoJSON
  const trajectoryLineGeoJSON = useMemo(() => {
    if (!playbackMode || trajectoryData.length === 0) return null
    
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: trajectoryData.slice(0, playbackIndex + 1)
      }
    }
  }, [playbackMode, trajectoryData, playbackIndex])

  // 生成热力图数据 - 基于工单密度
  const heatmapData = useMemo(() => {
    if (!showHeatmap) return null
    
    // 使用工单位置 + 一些随机点来创建热力图效果
    const points = [
      ...alerts.map(alert => ({
        type: 'Feature' as const,
        properties: { intensity: Math.random() * 0.5 + 0.5 },
        geometry: {
          type: 'Point' as const,
          coordinates: [alert.location.lng, alert.location.lat]
        }
      })),
      // 添加一些集中区域的热点
      ...Array.from({ length: 30 }, () => ({
        type: 'Feature' as const,
        properties: { intensity: Math.random() },
        geometry: {
          type: 'Point' as const,
          coordinates: [
            -73.9855 + (Math.random() - 0.5) * 0.15,
            40.7580 + (Math.random() - 0.5) * 0.15
          ]
        }
      }))
    ]
    
    return {
      type: 'FeatureCollection' as const,
      features: points
    }
  }, [showHeatmap, alerts])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .tech-marker {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .tech-marker:hover {
          transform: scale(1.15);
        }
        .cluster-marker {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .cluster-marker:hover {
          transform: scale(1.1);
        }
        .panel-float {
          background: rgba(17, 24, 39, 0.92);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(156, 163, 175, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
        .custom-scrollbar::-webkit-scrollbar-horizontal {
          display: none;
        }
      `}</style>

      {/* Map - Full Screen Background */}
      <div className="absolute inset-0">
        <Map
          ref={mapRef}
          {...viewport}
          onMove={evt => setViewport(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          maxZoom={20}
          minZoom={8}
        >
          {/* 热力图层 */}
          {showHeatmap && heatmapData && (
            <Source
              id="heatmap-source"
              type="geojson"
              data={heatmapData}
            >
              <Layer
                id="heatmap-layer"
                type="heatmap"
                paint={{
                  // 热力图权重
                  'heatmap-weight': ['get', 'intensity'],
                  // 热力图强度
                  'heatmap-intensity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 1,
                    15, 3
                  ],
                  // 热力图颜色渐变
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(33,102,172,0)',
                    0.2, 'rgb(103,169,207)',
                    0.4, 'rgb(209,229,240)',
                    0.6, 'rgb(253,219,199)',
                    0.8, 'rgb(239,138,98)',
                    1, 'rgb(178,24,43)'
                  ],
                  // 热力图半径
                  'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 2,
                    15, 20
                  ],
                  // 透明度
                  'heatmap-opacity': 0.7
                }}
              />
            </Source>
          )}
          
          {/* 车辆轨迹线 - 新增 */}
          {vehicleTrajectory.length > 0 && (
            <>
              {/* 完整轨迹线 */}
              <Source
                id="vehicle-trajectory-full"
                type="geojson"
                data={{
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: vehicleTrajectory.map(p => [p.lng, p.lat])
                  }
                }}
              >
                <Layer
                  id="trajectory-line-full"
                  type="line"
                  paint={{
                    'line-color': '#06b6d4',
                    'line-width': 3,
                    'line-opacity': 0.3,
                  }}
                />
              </Source>

              {/* 已播放轨迹线（渐变效果） */}
              <Source
                id="vehicle-trajectory-animated"
                type="geojson"
                data={{
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: vehicleTrajectory.slice(0, trajectoryAnimationIndex + 1).map(p => [p.lng, p.lat])
                  }
                }}
              >
                <Layer
                  id="trajectory-line-animated"
                  type="line"
                  paint={{
                    'line-color': '#06b6d4',
                    'line-width': 3,
                    'line-opacity': 0.8,
                  }}
                  layout={{
                    'line-join': 'round',
                    'line-cap': 'round'
                  }}
                />
              </Source>

              {/* 当前位置标记 - 使用小车图标 */}
              {trajectoryAnimationIndex < vehicleTrajectory.length && (
                <Marker
                  longitude={vehicleTrajectory[trajectoryAnimationIndex].lng}
                  latitude={vehicleTrajectory[trajectoryAnimationIndex].lat}
                  anchor="center"
                >
                  <div className="relative">
                    {/* 小车图标 */}
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 border border-cyan-400 shadow-lg shadow-cyan-500/50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                      </svg>
                    </div>
                  </div>
                </Marker>
              )}
            </>
          )}

          {/* 轨迹回放路线 - 旧代码保留 */}
          {playbackMode && trajectoryLineGeoJSON && (
            <Source id="trajectory" type="geojson" data={trajectoryLineGeoJSON as any}>
              <Layer
                id="trajectory-line"
                type="line"
                paint={{
                  'line-color': '#3b82f6',
                  'line-width': 3,
                  'line-opacity': 0.8,
                }}
              />
            </Source>
          )}

          {/* 渲染聚合点 */}
          {!playbackMode && clusteredPoints.map((point: any) => {
            const [longitude, latitude] = point.geometry.coordinates
            const { cluster: isCluster, point_count } = point.properties as ClusterProperties

            if (isCluster) {
              const size = 30 + Math.min(point_count || 0, 100) / 5
              
              return (
                <Marker
                  key={`cluster-${point.id}`}
                  longitude={longitude}
                  latitude={latitude}
                  anchor="center"
                >
                  <div
                    className="cluster-marker relative"
                    style={{ zIndex: 100 }}
                    onClick={() => handleClusterClick(point.id, longitude, latitude)}
                  >
                    <div
                      className="rounded-full flex items-center justify-center font-bold text-white"
                      style={{ 
                        width: `${size}px`, 
                        height: `${size}px`,
                        fontSize: `${Math.max(10, size / 4)}px`,
                        background: hoveredCluster === point.id 
                          ? 'rgba(59, 130, 246, 0.25)'
                          : 'rgba(59, 130, 246, 0.15)',
                        border: '2px solid rgba(96, 165, 250, 0.3)',
                        zIndex: 10,
                      }}
                      onMouseEnter={() => setHoveredCluster(point.id)}
                      onMouseLeave={() => setHoveredCluster(null)}
                    >
                      {point_count}
                    </div>
                  </div>
                </Marker>
              )
            }

            // 单个点标记 - 简化样式，无发光
            const props = point.properties
            const priority = props.priority as string
            const isUrgent = priority === 'urgent'
            const statusColor = {
              'urgent': '#ef4444',
              'high': '#f97316',
              'medium': '#eab308',
              'low': '#22c55e',
            }[priority] || '#6b7280'

            return (
              <Marker
                key={props.orderId}
                longitude={longitude}
                latitude={latitude}
                anchor="bottom"
              >
                <div 
                  className="relative flex flex-col items-center"
                  style={{ zIndex: 110 }}
                >
                  {/* 车牌号标签 - 移到图标上方 */}
                  <div 
                    className="mb-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold whitespace-nowrap"
                    style={{
                      backgroundColor: 'rgba(17, 24, 39, 0.5)',
                      border: '1px solid rgba(107, 114, 128, 0.5)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      zIndex: 20,
                      position: 'relative',
                    }}
                  >
                    {props.licensePlate}
                  </div>
                  
                  {/* 地图标记图标 - 紧急点位脉冲动画 - 缩小尺寸 */}
                  <MapPin 
                    className={cn("h-4 w-4", isUrgent && "animate-pulse")}
                    fill={statusColor}
                    color={statusColor}
                    style={{
                      animation: isUrgent ? 'pulse-scale 1.5s ease-in-out infinite' : undefined,
                      filter: `drop-shadow(0 0 2px ${statusColor})`,
                      zIndex: 10,
                      position: 'relative',
                    }}
                  />
                </div>
              </Marker>
            )
          })}

          {/* 渲染技术人员 - 回放模式下只显示回放车辆 */}
          {technicians.filter(t => t.status !== 'offline').map(tech => {
            if (!tech.currentLocation) return null
            if (playbackMode && tech.id !== playbackVehicle) return null

            const statusColors: Record<string, string> = {
              available: '#22c55e',
              busy: '#3b82f6',
              'on-break': '#eab308',
              offline: '#6b7280',
            }

            const isSelected = selectedTech === tech.id || tech.id === playbackVehicle
            const displayLng = playbackMode && tech.id === playbackVehicle && trajectoryData[playbackIndex]
              ? trajectoryData[playbackIndex][0]
              : tech.currentLocation.lng
            const displayLat = playbackMode && tech.id === playbackVehicle && trajectoryData[playbackIndex]
              ? trajectoryData[playbackIndex][1]
              : tech.currentLocation.lat
            
            // 只在缩放级别 >= 13 或选中时显示标签
            const showTechLabel = viewport.zoom >= 13 || isSelected

            return (
              <Marker
                key={tech.id}
                longitude={displayLng}
                latitude={displayLat}
                anchor="center"
              >
                <div
                  className="tech-marker relative"
                  style={{ zIndex: isSelected ? 200 : 140 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTechClick(tech)
                  }}
                >
                  {/* 车牌号标签 - 放在头像上方 */}
                  {showTechLabel && (
                    <div 
                      className="mb-1 whitespace-nowrap flex justify-center"
                      style={{ zIndex: 40, position: 'relative' }}
                    >
                      <div 
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold",
                          isSelected && "shadow-lg"
                        )}
                        style={{
                          backgroundColor: 'rgba(17, 24, 39, 0.5)',
                          border: '1px solid rgba(107, 114, 128, 0.5)',
                          color: 'rgba(255, 255, 255, 0.8)',
                        }}
                      >
                        {(tech as any).licensePlate || tech.name}
                      </div>
                    </div>
                  )}

                  {/* 头像 - 增强视觉效果 */}
                  <div className="relative">
                    {/* 状态光晕效果 */}
                    {tech.status === 'available' && (
                      <div 
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          backgroundColor: statusColors[tech.status],
                          opacity: 0.3,
                          zIndex: 5,
                        }}
                      />
                    )}
                    
                    {/* 头像本体 */}
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 object-cover transition-all duration-300 cursor-pointer",
                        isSelected ? "scale-125 opacity-100 shadow-lg" : "opacity-90 hover:opacity-100 hover:scale-110"
                      )}
                      style={{ 
                        borderColor: statusColors[tech.status],
                        boxShadow: `0 0 12px ${statusColors[tech.status]}`,
                        zIndex: 10,
                        position: 'relative',
                      }}
                    />
                    
                    {/* 状态指示点 */}
                    <div 
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-gray-900",
                        tech.status === 'available' && "animate-pulse"
                      )}
                      style={{ 
                        backgroundColor: statusColors[tech.status],
                        zIndex: 15,
                      }}
                    />
                  </div>

                </div>
              </Marker>
            )
          })}

          {/* 渲染告警点位 - 简化光晕效果 */}
          {alerts.map((alert) => {
            const alertColors = {
              emergency: '#dc2626',
              urgent: '#ea580c',
              warning: '#f59e0b',
            }
            
            // 分层级：告警图标层 150-170，标签层 50-70
            const alertZIndex = {
              emergency: { icon: 170, label: 70 },
              urgent: { icon: 160, label: 60 },
              warning: { icon: 150, label: 50 },
            }
            
            const isSelected = selectedAlert === alert.id
            const zIndex = alertZIndex[alert.type]
            
            // 添加偏移避免重叠：每个告警点在原位置基础上添加小偏移
            const offsetMap = {
              'alert-1': { lat: 0, lng: 0 },        // 第一个不偏移
              'alert-2': { lat: 0.002, lng: 0.003 }, // 第二个向右上偏移
              'alert-3': { lat: -0.002, lng: 0.002 }, // 第三个向右下偏移
            }
            const offset = offsetMap[alert.id as keyof typeof offsetMap] || { lat: 0, lng: 0 }
            
            return (
              <Marker
                key={alert.id}
                longitude={alert.location.lng + offset.lng}
                latitude={alert.location.lat + offset.lat}
                anchor="center"
              >
                <div 
                  className="relative cursor-pointer transition-all"
                  style={{ zIndex: isSelected ? 200 : zIndex.icon }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAlertClick(alert.id)
                  }}
                >
                  <div className="flex flex-col items-center">
                    {/* 告警类型标签 - 移到图标上方 */}
                    <div 
                      className={cn(
                        "mb-1 px-2 py-0.5 rounded font-bold whitespace-nowrap transition-all",
                        isSelected ? "text-[9px]" : "text-[8px]"
                      )}
                      style={{
                        backgroundColor: 'rgba(17, 24, 39, 0.5)',
                        border: '1px solid rgba(107, 114, 128, 0.5)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        zIndex: zIndex.label,
                        position: 'relative',
                      }}
                    >
                      {alert.type.toUpperCase()}
                    </div>

                    {/* 告警图标 - 使用CSS动画实现光圈 */}
                    <div className="relative flex items-center justify-center">
                      {/* 背景动画光圈 - 使用伪元素 */}
                      {!isSelected && (
                        <>
                          <div 
                            className="absolute rounded-full animate-ping"
                            style={{
                              width: '48px',
                              height: '48px',
                              backgroundColor: alertColors[alert.type],
                              opacity: 0.2,
                              animationDuration: '3s',
                            }}
                          />
                          <div 
                            className="absolute rounded-full animate-ping"
                            style={{
                              width: '36px',
                              height: '36px',
                              backgroundColor: alertColors[alert.type],
                              opacity: 0.3,
                              animationDuration: '2.5s',
                              animationDelay: '0.5s',
                            }}
                          />
                        </>
                      )}
                      
                      {/* 中心图标 */}
                      <div
                        className={cn(
                          "relative rounded-full flex items-center justify-center shadow-lg transition-all",
                          isSelected ? "w-8 h-8 ring-4 ring-white/30" : "w-6 h-6"
                        )}
                        style={{
                          backgroundColor: alertColors[alert.type],
                          boxShadow: isSelected 
                            ? `0 0 30px ${alertColors[alert.type]}, 0 0 60px ${alertColors[alert.type]}` 
                            : `0 0 20px ${alertColors[alert.type]}`,
                          zIndex: 10,
                        }}
                      >
                        <AlertTriangle className={cn("text-white", isSelected ? "h-5 w-5" : "h-4 w-4")} />
                      </div>
                    </div>
                  </div>
                </div>
              </Marker>
            )
          })}

          {/* 渲染车辆 markers - 优化为暗色系带车辆图标 */}
          {mockVehicles.map(vehicle => {
            const isSelected = selectedVehicle === vehicle.id
            const statusConfig: Record<string, { bg: string; glow: string; icon: string }> = {
              active: { 
                bg: 'bg-gradient-to-br from-green-600 to-green-700',
                glow: 'shadow-green-500/50',
                icon: 'text-green-200'
              },
              idle: { 
                bg: 'bg-gradient-to-br from-yellow-600 to-yellow-700',
                glow: 'shadow-yellow-500/50',
                icon: 'text-yellow-200'
              },
              maintenance: { 
                bg: 'bg-gradient-to-br from-orange-600 to-orange-700',
                glow: 'shadow-orange-500/50',
                icon: 'text-orange-200'
              },
              out_of_service: { 
                bg: 'bg-gradient-to-br from-red-600 to-red-700',
                glow: 'shadow-red-500/50',
                icon: 'text-red-200'
              },
            }

            const config = statusConfig[vehicle.status]

            return (
              <Marker
                key={vehicle.id}
                longitude={vehicle.gps.lng}
                latitude={vehicle.gps.lat}
                anchor="center"
              >
                <div
                  className="cursor-pointer relative"
                  style={{ zIndex: isSelected ? 200 : 130 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVehicleClick(vehicle.id)
                  }}
                >
                  {/* 车牌号标签 - 移到图标上方 */}
                  <div 
                    className="mb-0.5 whitespace-nowrap"
                    style={{ zIndex: 30, position: 'relative' }}
                  >
                    <div
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[7px] font-bold",
                        isSelected && "shadow-lg"
                      )}
                      style={{
                        backgroundColor: 'rgba(17, 24, 39, 0.5)',
                        border: '1px solid rgba(107, 114, 128, 0.5)',
                        color: 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      {vehicle.licensePlate}
                    </div>
                  </div>

                  {/* 车辆图标容器 - 选中时只放大，不改变背景 */}
                  <div
                    className={cn(
                      "relative w-5 h-5 rounded-lg flex items-center justify-center transition-all border",
                      config.bg,
                      "border-gray-800 shadow-lg",
                      config.glow,
                      isSelected && "scale-125"
                    )}
                    style={{ zIndex: 10 }}
                  >
                    {/* 车辆SVG图标 - 进一步缩小 */}
                    <svg 
                      className={cn("w-3 h-3", config.icon)} 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                    
                    {/* 状态指示器 */}
                    {vehicle.status === 'active' && (
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse border border-gray-900" />
                    )}
                  </div>
                </div>
              </Marker>
            )
          })}
        </Map>
      </div>

      {/* 左侧面板 */}
      <LeftPanel
        isOpen={leftPanelOpen}
        onToggle={() => setLeftPanelOpen(!leftPanelOpen)}
        selectedVehicle={selectedVehicle}
        onVehicleClick={handleVehicleClick}
        vehicles={mockVehicles}
        isPageVisible={isPageVisible}
      />

      {/* 右侧面板 */}
      <RightPanel
        isOpen={rightPanelOpen}
        onToggle={() => setRightPanelOpen(!rightPanelOpen)}
        technicians={technicians}
        selectedTech={selectedTech}
        onTechClick={(techId) => {
          const tech = technicians.find(t => t.id === techId)
          if (tech) handleTechClick(tech)
        }}
        isPageVisible={isPageVisible}
      />

      {/* 地图图例 - 紧靠左侧面板 */}
      <MapLegend activeTab="technicians" leftPanelOpen={leftPanelOpen} />

      {/* 地图控制按钮组 - 右上角 */}
      <div className={cn(
        "absolute top-4 z-20 flex gap-2",
        rightPanelOpen ? "right-[21rem]" : "right-4"
      )}>
        {/* 热力图切换按钮 */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={cn(
            "p-2.5 backdrop-blur-md border rounded-lg shadow-xl transition-all group",
            showHeatmap 
              ? "bg-orange-500/20 border-orange-400/50 hover:bg-orange-500/30" 
              : "bg-black/90 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-400/50"
          )}
          title="Toggle Heatmap"
        >
          <Flame className={cn(
            "h-4 w-4 transition-colors",
            showHeatmap ? "text-orange-400" : "text-cyan-400"
          )} />
        </button>
        
        {/* 地图重置按钮 */}
        <button
          onClick={handleResetMap}
          className="p-2.5 bg-black/90 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-xl hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all group"
          title="Reset Map View"
        >
          <RotateCcw className="h-4 w-4 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* 告警信息面板 - 紧贴左侧面板边缘和顶部，无间隙 */}
      {alertPanelOpen && (
        <div className={cn(
          "absolute top-0 z-20 w-56 transition-all duration-300",
          leftPanelOpen ? "left-80" : "left-0"
        )}>
          <div className="bg-black/90 backdrop-blur-md border border-gray-800/50 rounded-br-lg p-2 shadow-xl">
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-gray-700/50">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[10px] font-bold text-[#F8FAFC] uppercase tracking-wider">
                  Active Alerts
                </h3>
                {/* 数字徽章 - 股票式动画效果 */}
                <div className="relative">
                  <span className={cn(
                    "px-1.5 py-0.5 bg-[#EF4444] text-white text-[8px] font-bold rounded-full inline-flex items-center gap-0.5",
                    alertCountChange !== 0 && "animate-pulse"
                  )}>
                    {alerts.filter(a => a.status === 'active').length}
                    {/* 增减箭头 */}
                    {alertCountChange > 0 && (
                      <span className="text-green-300 animate-bounce">↑</span>
                    )}
                    {alertCountChange < 0 && (
                      <span className="text-orange-300 animate-bounce">↓</span>
                    )}
                  </span>
                  {/* 数字变化动画提示 */}
                  {alertCountChange > 0 && (
                    <span className="absolute -top-3 -right-2 text-green-400 text-[9px] font-bold animate-ping">
                      +{alertCountChange}
                    </span>
                  )}
                  {alertCountChange < 0 && (
                    <span className="absolute -top-3 -right-2 text-orange-400 text-[9px] font-bold animate-ping">
                      {alertCountChange}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* 推送控制按钮 */}
                <button
                  onClick={() => setIsAlertPushEnabled(!isAlertPushEnabled)}
                  className="p-0.5 hover:bg-gray-700 rounded transition-colors"
                  title={isAlertPushEnabled ? "Pause Push" : "Resume Push"}
                >
                  {isAlertPushEnabled ? (
                    <Pause className="h-2.5 w-2.5 text-yellow-400" />
                  ) : (
                    <Play className="h-2.5 w-2.5 text-green-400" />
                  )}
                </button>
                {/* 关闭按钮 */}
                <button
                  onClick={() => setAlertPanelOpen(false)}
                  className="p-0.5 hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="h-2.5 w-2.5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* 告警列表 - 移除横向滚动 */}
            <div className="space-y-1 max-h-72 overflow-y-auto overflow-x-hidden custom-scrollbar">
              {alerts.map(alert => {
                const alertConfig = {
                  emergency: { 
                    bg: '#271414', 
                    border: 'rgba(153, 34, 34, 0.2)',
                    dot: 'bg-[#EF4444]',
                    text: 'text-[#EF4444]'
                  },
                  urgent: { 
                    bg: '#2E1E16', 
                    border: 'rgba(146, 64, 14, 0.2)',
                    dot: 'bg-[#F97316]',
                    text: 'text-[#F97316]'
                  },
                  warning: { 
                    bg: '#2B2517', 
                    border: 'rgba(133, 77, 14, 0.2)',
                    dot: 'bg-[#FBBF24]',
                    text: 'text-[#FBBF24]'
                  },
                }[alert.type]

                const timeAgo = Math.floor((Date.now() - new Date(alert.time).getTime()) / 60000)
                const isSelected = selectedAlert === alert.id

                return (
                  <div
                    key={alert.id}
                    onClick={() => handleAlertClick(alert.id)}
                    style={{ backgroundColor: alertConfig.bg, borderColor: alertConfig.border }}
                    className={cn(
                      "p-1.5 rounded border transition-all cursor-pointer relative",
                      isSelected && "shadow-sm",
                      "hover:brightness-110",
                      // Add pulsing animation for emergency and urgent
                      alert.type === 'emergency' && "animate-pulse-glow-red",
                      alert.type === 'urgent' && "animate-pulse-glow-orange"
                    )}
                  >
                    <div className="flex items-start gap-1.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0", 
                        alertConfig.dot,
                        // Enhanced pulsing for dot
                        (alert.type === 'emergency' || alert.type === 'urgent') && "animate-pulse"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <h4 className="text-[9px] font-bold text-[#F8FAFC] leading-tight">
                            {alert.title}
                          </h4>
                          <span className={cn(
                            "text-[7px] uppercase tracking-wide flex-shrink-0 font-medium", 
                            alertConfig.text,
                            // Add subtle pulsing to the type badge
                            alert.type === 'emergency' && "animate-pulse"
                          )}>
                            {alert.type}
                          </span>
                        </div>
                        <p className="text-[8px] text-[#94A3B8] mb-1 truncate leading-tight">
                          📍 {alert.location.address}
                        </p>
                        <div className="flex items-center justify-between text-[7px]">
                          <span className="text-[#64748B]">
                            {timeAgo > 0 ? `${timeAgo} min ago` : 'Just now'}
                          </span>
                          {alert.status === 'acknowledged' && (
                            <span className="px-1 py-0.5 bg-green-500/20 text-green-400 rounded text-[7px] font-semibold">
                              ACK
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 告警面板切换按钮（当面板关闭时显示） */}
      {!alertPanelOpen && (
        <button
          onClick={() => setAlertPanelOpen(true)}
          className={cn(
            "absolute top-0 z-20 p-1.5 bg-red-500 hover:bg-red-600 rounded-br-lg shadow-lg transition-all animate-pulse",
            leftPanelOpen ? "left-80" : "left-0"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-white" />
        </button>
      )}

      {/* Playback Control Panel - Bottom Center */}
      {playbackMode && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="panel-float rounded-xl px-6 py-4 flex items-center gap-4 shadow-2xl">
            <button
              onClick={stopPlayback}
              className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
              title="Stop Playback"
            >
              <X className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => setPlaybackIndex(0)}
              className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold">Trajectory Playback</span>
              <span className="text-gray-400 text-[10px]">
                Frame {playbackIndex + 1} / {trajectoryData.length}
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max={trajectoryData.length - 1}
              value={playbackIndex}
              onChange={(e) => setPlaybackIndex(Number(e.target.value))}
              className="w-48"
            />
          </div>
        </div>
      )}
    </div>
  )
}
