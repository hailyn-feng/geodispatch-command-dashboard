import { CheckCircle, Zap, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FiltersSectionProps {
  selectedStatuses: string[]
  onStatusToggle: (status: string) => void
}

const STATUS_FILTERS = [
  { id: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-green-500/20 border-green-500 text-green-400' },
  { id: 'in_progress', label: 'In Progress', icon: Zap, color: 'bg-cyan-500/20 border-cyan-500 text-cyan-400' },
  { id: 'scheduled', label: 'Scheduled', icon: Clock, color: 'bg-blue-500/20 border-blue-500 text-blue-400' },
  { id: 'urgent', label: 'Urgent', icon: AlertCircle, color: 'bg-red-500/20 border-red-500 text-red-400' },
]

export function FiltersSection({ selectedStatuses, onStatusToggle }: FiltersSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter by Status</h3>
      <div className="grid grid-cols-2 gap-2">
        {STATUS_FILTERS.map(filter => {
          const Icon = filter.icon
          const isActive = selectedStatuses.includes(filter.id)
          
          return (
            <button
              key={filter.id}
              onClick={() => onStatusToggle(filter.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                isActive ? filter.color : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold">{filter.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
