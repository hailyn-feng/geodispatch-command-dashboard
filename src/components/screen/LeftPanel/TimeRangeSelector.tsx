import { Calendar } from 'lucide-react'

interface TimeRangeSelectorProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

export function TimeRangeSelector({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: TimeRangeSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5" />
        Time Range
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-gray-500 font-semibold block mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded text-[10px] text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 font-semibold block mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded text-[10px] text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
