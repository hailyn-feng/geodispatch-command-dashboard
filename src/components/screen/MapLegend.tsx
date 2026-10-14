import { cn } from '@/lib/utils'

interface MapLegendProps {
  activeTab: 'technicians' | 'fleet'
  leftPanelOpen: boolean
}

export function MapLegend({ activeTab, leftPanelOpen }: MapLegendProps) {
  const technicianLegend = [
    { label: 'Available', color: 'bg-green-500' },
    { label: 'Busy', color: 'bg-cyan-500' },
    { label: 'On Break', color: 'bg-orange-500' },
    { label: 'Offline', color: 'bg-gray-500' },
  ]

  const orderStatusLegend = [
    { label: 'Completed', color: 'bg-blue-500' },
    { label: 'In Progress', color: 'bg-yellow-500' },
    { label: 'Scheduled', color: 'bg-sky-300' },
    { label: 'Urgent', color: 'bg-red-500' },
  ]

  const fleetLegend = [
    { label: 'Active', color: 'bg-green-500' },
    { label: 'In Transit', color: 'bg-cyan-500' },
    { label: 'Maintenance', color: 'bg-orange-500' },
    { label: 'Idle', color: 'bg-gray-500' },
  ]

  const legendData = activeTab === 'fleet' ? fleetLegend : [...technicianLegend, ...orderStatusLegend]

  return (
    <div
      className={cn(
        "absolute bottom-0 transition-all duration-300 z-20",
        leftPanelOpen ? "left-80" : "left-0"
      )}
    >
      <div className="bg-black/90 backdrop-blur-md border border-gray-800 rounded-tl-lg p-2 space-y-1.5">
        <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">
          {activeTab === 'fleet' ? 'Fleet Status' : 'Map Legend'}
        </h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {legendData.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", item.color)} />
              <span className="text-[9px] text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
