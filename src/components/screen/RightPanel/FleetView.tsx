import { Car, Gauge, Clock, AlertTriangle, MapPin, User, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { memo, useMemo, useState, useEffect } from 'react'
import CountUp from 'react-countup'

interface Vehicle {
  id: string
  licensePlate: string
  status: 'active' | 'idle' | 'maintenance' | 'out_of_service'
  currentLocation: string
  mileageToday: number
  assignedTech?: string
  gps: { lat: number; lng: number }
}

interface FleetViewProps {
  onVehicleClick: (vehicleId: string) => void
  selectedVehicle: string | null
  vehicles: Vehicle[]
  isPageVisible?: boolean
}

// 优化：使用memo包裹主组件
export const FleetView = memo(function FleetView({ onVehicleClick, selectedVehicle, vehicles, isPageVisible = true }: FleetViewProps) {
  // 添加key状态，用于触发CountUp重新动画
  const [animationKey, setAnimationKey] = useState(0)
  
  // 使用useMemo缓存统计计算
  const stats = useMemo(() => ({
    activeCount: vehicles.filter(v => v.status === 'active').length,
    idleCount: vehicles.filter(v => v.status === 'idle').length,
    maintenanceCount: vehicles.filter(v => v.status === 'maintenance').length,
    offlineCount: vehicles.filter(v => v.status === 'out_of_service').length,
    totalMileage: vehicles.reduce((sum, v) => sum + v.mileageToday, 0),
    avgMileage: Math.round(vehicles.reduce((sum, v) => sum + v.mileageToday, 0) / vehicles.length)
  }), [vehicles])

  // 每5秒触发一次动画更新，增加页面可见性控制
  useEffect(() => {
    if (!isPageVisible) return
    
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isPageVisible])

  return (
    <div className="space-y-3 flex-1 flex flex-col min-h-0">
      {/* 车队KPI指标 - 精致2x3网格布局 */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Fleet KPIs</h3>
        <div className="grid grid-cols-2 gap-2">
          <KPICard
            icon={Car}
            label="Active"
            value={stats.activeCount}
            trend="up"
            bgColor="#132E24"
            iconColor="text-[#34D399]"
            valueColor="text-[#34D399]"
            animationKey={animationKey}
          />
          <KPICard
            icon={Clock}
            label="Idle"
            value={stats.idleCount}
            trend="down"
            bgColor="#2B2517"
            iconColor="text-[#FBBF24]"
            valueColor="text-[#FBBF24]"
            animationKey={animationKey}
          />
          <KPICard
            icon={AlertTriangle}
            label="Maint"
            value={stats.maintenanceCount}
            trend="neutral"
            bgColor="#2E1E16"
            iconColor="text-[#F97316]"
            valueColor="text-[#F97316]"
            animationKey={animationKey}
          />
          <KPICard
            icon={Gauge}
            label="Total Mi"
            value={stats.totalMileage}
            trend="up"
            bgColor="#142738"
            iconColor="text-[#38BDF8]"
            valueColor="text-[#38BDF8]"
            animationKey={animationKey}
          />
          <KPICard
            icon={Gauge}
            label="Avg Mi"
            value={stats.avgMileage}
            trend="up"
            tooltip="Average Mileage per Vehicle"
            bgColor="#2A2440"
            iconColor="text-[#A78BFA]"
            valueColor="text-[#A78BFA]"
            animationKey={animationKey}
          />
          <KPICard
            icon={Car}
            label="Offline"
            value={stats.offlineCount}
            trend="down"
            bgColor="#2A1818"
            iconColor="text-[#FB7185]"
            valueColor="text-[#FB7185]"
            animationKey={animationKey}
          />
        </div>
      </div>

      {/* 车辆列表 */}
      <div className="space-y-2 flex-1 flex flex-col min-h-0">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex-shrink-0">
          Fleet Status ({vehicles.length})
        </h3>
        <div className="space-y-1 px-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 max-h-[300px]">
          {vehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedVehicle === vehicle.id}
              onClick={() => onVehicleClick(vehicle.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

// 优化：使用memo包裹KPICard - 恢复CountUp动画
const KPICard = memo(function KPICard({ 
  icon: Icon, 
  label, 
  value, 
  trend = 'neutral',
  tooltip,
  bgColor,
  iconColor,
  valueColor,
  animationKey
}: { 
  icon: any
  label: string
  value: number | string
  trend?: 'up' | 'down' | 'neutral'
  tooltip?: string
  bgColor: string
  iconColor: string
  valueColor: string
  animationKey: number
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500'

  return (
    <div 
      className="relative overflow-hidden rounded-lg p-3 border border-gray-800/50 backdrop-blur-sm group"
      style={{ backgroundColor: bgColor }}
      title={tooltip}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Icon className={cn("h-4 w-4", iconColor)} />
            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wide">{label}</span>
            <TrendIcon className={cn("h-3 w-3", trendColor)} />
          </div>
          {/* 数字显示 - 平滑循环动画 */}
          <p className={cn(
            "text-2xl font-bold font-mono",
            valueColor
          )}>
            {typeof value === 'number' ? (
              <CountUp 
                key={animationKey}
                start={Math.max(0, value - 3)}
                end={value} 
                duration={2.5}
                separator="," 
                preserveValue={true}
                useEasing={true}
              />
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </div>
  )
})

// 优化：使用memo包裹VehicleCard
const VehicleCard = memo(function VehicleCard({ 
  vehicle, 
  isSelected, 
  onClick 
}: { 
  vehicle: Vehicle
  isSelected: boolean
  onClick: () => void
}) {
  const statusConfig = {
    active: { label: 'Active', dotColor: 'bg-[#34D399]', borderColor: 'border-[#34D399]/30' },
    idle: { label: 'Idle', dotColor: 'bg-yellow-400', borderColor: 'border-yellow-500/30' },
    maintenance: { label: 'Maintenance', dotColor: 'bg-orange-400', borderColor: 'border-orange-500/30' },
    out_of_service: { label: 'Offline', dotColor: 'bg-gray-400', borderColor: 'border-gray-500/30' },
  }

  const config = statusConfig[vehicle.status]

  return (
    <button
      onClick={onClick}
      style={isSelected ? { backgroundColor: '#13272C', borderColor: 'rgba(34, 107, 116, 0.34)' } : { backgroundColor: '#111827', borderColor: '#273444' }}
      className={cn(
        "w-full p-2 rounded-lg border transition-all text-left group",
        isSelected && "shadow-sm"
      )}
    >
      <div className="space-y-1.5">
        {/* 车牌号和状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
            <span className="text-sm font-extrabold text-[#F8FAFC] font-mono">{vehicle.licensePlate}</span>
          </div>
          <span className="text-[9px] text-[#CBD5E1] font-medium uppercase tracking-wider">{config.label}</span>
        </div>
        
        {/* 位置和技术员信息 */}
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-[#94A3B8]" />
            <span className="text-[#94A3B8] truncate">{vehicle.currentLocation}</span>
            {vehicle.assignedTech && (
              <>
                <span className="text-gray-600">•</span>
                <User className="h-2.5 w-2.5 flex-shrink-0 text-[#60A5FA]" />
                <span className="text-[#60A5FA] truncate">{vehicle.assignedTech}</span>
              </>
            )}
          </div>
        </div>

        {/* 里程数 - 移除分隔线 */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[9px] text-[#64748B] font-medium">Today's Mileage</span>
          <span className="text-[11px] text-[#38BDF8] font-mono font-bold">{vehicle.mileageToday} mi</span>
        </div>
      </div>
    </button>
  )
})
