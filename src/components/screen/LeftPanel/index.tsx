import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RegionPieChart } from './RegionPieChart'
import { FleetView } from '../RightPanel/FleetView'
import { memo } from 'react'

interface LeftPanelProps {
  isOpen: boolean
  onToggle: () => void
  selectedVehicle: string | null
  onVehicleClick: (vehicleId: string) => void
  vehicles: Array<{
    id: string
    licensePlate: string
    status: 'active' | 'idle' | 'maintenance' | 'out_of_service'
    currentLocation: string
    mileageToday: number
    assignedTech?: string
    gps: { lat: number; lng: number }
  }>
  isPageVisible?: boolean
}

export const LeftPanel = memo(function LeftPanel({
  isOpen,
  onToggle,
  selectedVehicle,
  onVehicleClick,
  vehicles,
  isPageVisible = true,
}: LeftPanelProps) {
  return (
    <>
      {/* 面板主体 */}
      <div
        className={cn(
          "absolute top-0 left-0 bottom-0 w-80 bg-black/80 backdrop-blur-md border-r border-gray-800 transition-transform duration-300 overflow-hidden flex flex-col",
          !isOpen && "-translate-x-full"
        )}
      >
        {/* 内容区 - 不滚动 */}
        <div className="flex-1 p-3 space-y-3 flex flex-col">
          {/* Region Distribution 标题 */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              Region Distribution
            </h3>
            <RegionPieChart />
          </div>
          
          <FleetView 
            selectedVehicle={selectedVehicle}
            onVehicleClick={onVehicleClick}
            vehicles={vehicles}
            isPageVisible={isPageVisible}
          />
        </div>
      </div>

      {/* 折叠按钮 */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-6 h-12 bg-black/80 backdrop-blur-md border-y border-r border-gray-800 flex items-center justify-center hover:bg-gray-900/80 transition-all z-10",
          isOpen ? "left-80" : "left-0"
        )}
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            !isOpen && "rotate-180"
          )}
        />
      </button>
    </>
  )
})
