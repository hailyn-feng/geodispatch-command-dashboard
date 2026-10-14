import { Car, MapPin, CheckCircle, Zap, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MapLegendProps {
  activeTab: 'technicians' | 'fleet'
}

export function MapLegend({ activeTab }: MapLegendProps) {
  if (activeTab === 'technicians') {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          Map Legend
        </h3>
        <div className="space-y-2">
          <div className="space-y-1.5">
            <p className="text-[9px] text-gray-500 font-semibold">Technician Status</p>
            <div className="grid grid-cols-2 gap-2">
              <LegendItem color="bg-cyan-500" label="On Duty" />
              <LegendItem color="bg-green-500" label="Available" />
              <LegendItem color="bg-orange-500" label="Break" />
              <LegendItem color="bg-gray-500" label="Off Duty" />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] text-gray-500 font-semibold">Work Order Status</p>
            <div className="space-y-1">
              <LegendItem icon={CheckCircle} color="text-green-400" label="Completed" />
              <LegendItem icon={Zap} color="text-cyan-400" label="In Progress" />
              <LegendItem icon={Clock} color="text-blue-400" label="Scheduled" />
              <LegendItem icon={AlertCircle} color="text-red-400" label="Urgent" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Car className="h-3.5 w-3.5" />
        Vehicle Legend
      </h3>
      <div className="space-y-2">
        <div className="space-y-1.5">
          <p className="text-[9px] text-gray-500 font-semibold">Vehicle Status</p>
          <div className="space-y-1">
            <LegendItem color="bg-green-500" label="Active - On Route" />
            <LegendItem color="bg-cyan-500" label="Active - On Site" />
            <LegendItem color="bg-yellow-500" label="Idle" />
            <LegendItem color="bg-orange-500" label="Maintenance Required" />
            <LegendItem color="bg-red-500" label="Offline" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ 
  color, 
  label, 
  icon: Icon 
}: { 
  color: string
  label: string
  icon?: any
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon ? (
        <Icon className={cn("h-3 w-3", color)} />
      ) : (
        <div className={cn("w-3 h-3 rounded-full", color)} />
      )}
      <span className="text-[10px] text-gray-300">{label}</span>
    </div>
  )
}
