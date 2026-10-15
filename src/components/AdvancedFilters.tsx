import { useState } from 'react'
import { Search, X, Calendar, User, Flag, Filter, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkOrderStatus, WorkOrderPriority } from '@/types'

export interface FilterValues {
  searchTerm: string
  status: WorkOrderStatus | 'all'
  priority: WorkOrderPriority | 'all'
  technicianId: string
  dateRange: { start: string; end: string }
  category: string
}

interface AdvancedFiltersProps {
  filters: FilterValues
  onFiltersChange: (filters: FilterValues) => void
  technicians: Array<{ id: string; name: string }>
  categories: string[]
  className?: string
}

const statusOptions: Array<{ value: WorkOrderStatus | 'all'; label: string; color: string }> = [
  { value: 'all', label: 'All Status', color: 'bg-gray-500' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'assigned', label: 'Assigned', color: 'bg-purple-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-400' },
]

const priorityOptions: Array<{ value: WorkOrderPriority | 'all'; label: string; color: string }> = [
  { value: 'all', label: 'All Priority', color: 'bg-gray-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
]

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  technicians,
  categories,
  className,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleReset = () => {
    onFiltersChange({
      searchTerm: '',
      status: 'all',
      priority: 'all',
      technicianId: 'all',
      dateRange: { start: '', end: '' },
      category: 'all',
    })
  }

  const hasActiveFilters = 
    filters.searchTerm !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.technicianId !== 'all' ||
    filters.dateRange.start !== '' ||
    filters.dateRange.end !== '' ||
    filters.category !== 'all'

  const activeFilterCount = [
    filters.searchTerm !== '',
    filters.status !== 'all',
    filters.priority !== 'all',
    filters.technicianId !== 'all',
    filters.dateRange.start !== '' || filters.dateRange.end !== '',
    filters.category !== 'all',
  ].filter(Boolean).length

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      {/* Search Bar */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, customer, category..."
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {filters.searchTerm && (
              <button
                onClick={() => onFiltersChange({ ...filters, searchTerm: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors relative',
              isExpanded
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Flag className="inline h-4 w-4 mr-1" />
                Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFiltersChange({ ...filters, status: option.value })}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      filters.status === option.value
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    <div className={cn('w-2 h-2 rounded-full', option.color)} />
                    <span className="truncate">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Flag className="inline h-4 w-4 mr-1" />
                Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFiltersChange({ ...filters, priority: option.value })}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      filters.priority === option.value
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    <div className={cn('w-2 h-2 rounded-full', option.color)} />
                    <span className="truncate">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Technician Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Technician
              </label>
              <select
                value={filters.technicianId}
                onChange={(e) => onFiltersChange({ ...filters, technicianId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Technicians</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, start: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
                    placeholder="Start date"
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  />
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, end: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
                    placeholder="End date"
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 py-1">
                Active filters:
              </span>
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                  Status: {statusOptions.find(s => s.value === filters.status)?.label}
                  <button onClick={() => onFiltersChange({ ...filters, status: 'all' })}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.priority !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                  Priority: {priorityOptions.find(p => p.value === filters.priority)?.label}
                  <button onClick={() => onFiltersChange({ ...filters, priority: 'all' })}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.technicianId !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                  Technician: {technicians.find(t => t.id === filters.technicianId)?.name}
                  <button onClick={() => onFiltersChange({ ...filters, technicianId: 'all' })}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                  Category: {filters.category}
                  <button onClick={() => onFiltersChange({ ...filters, category: 'all' })}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(filters.dateRange.start || filters.dateRange.end) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                  Date: {filters.dateRange.start || '...'} - {filters.dateRange.end || '...'}
                  <button onClick={() => onFiltersChange({ ...filters, dateRange: { start: '', end: '' } })}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
