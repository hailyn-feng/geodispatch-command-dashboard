import { Activity, TrendingUp, Users, Car } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedCounter } from '@/components/AnimatedCounter'

interface LiveStatsCardsProps {
  stats: {
    totalOrders: number
    activeOrders: number
    completedToday: number
    avgResponseTime: string
    totalRevenue: number
    activeTechnicians: number
    activeVehicles: number
  }
}

export function LiveStatsCards({ stats }: LiveStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard
        icon={Activity}
        label="Active Orders"
        value={stats.activeOrders}
        color="bg-gradient-to-br from-cyan-600 to-cyan-800"
      />
      <StatCard
        icon={TrendingUp}
        label="Completed Today"
        value={stats.completedToday}
        color="bg-gradient-to-br from-green-600 to-green-800"
      />
      <StatCard
        icon={Users}
        label="Active Techs"
        value={stats.activeTechnicians}
        color="bg-gradient-to-br from-purple-600 to-purple-800"
      />
      <StatCard
        icon={Car}
        label="Active Vehicles"
        value={stats.activeVehicles}
        color="bg-gradient-to-br from-pink-600 to-pink-800"
      />
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any
  label: string
  value: number
  color: string
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg p-3", color, "hover:opacity-90 transition-opacity")}>
      <div className="absolute top-0 right-0 opacity-10">
        <Icon className="h-12 w-12" />
      </div>
      <div className="relative">
        <Icon className="h-4 w-4 text-white mb-1" />
        <p className="text-2xl font-bold text-white font-mono">
          <AnimatedCounter value={value} />
        </p>
        <p className="text-[8px] text-white/80 font-semibold uppercase tracking-wide">{label}</p>
      </div>
    </div>
  )
}
