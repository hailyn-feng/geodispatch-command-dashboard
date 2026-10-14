import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { ChevronLeft, ChevronRight, Clock, AlertCircle, X, CheckCircle, Calendar, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkOrder } from '@/types'
import Dashboard from './Dashboard'
import toast, { Toaster } from 'react-hot-toast'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function TechnicianSchedule() {
  const { workOrders, technicians, updateWorkOrder } = useStore()
  const [activeTab, setActiveTab] = useState<'schedule' | 'dashboard'>('schedule')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTechnician, setSelectedTechnician] = useState<string>('all')
  const [draggedOrder, setDraggedOrder] = useState<WorkOrder | null>(null)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [pendingSchedule, setPendingSchedule] = useState<{
    order: WorkOrder
    date: Date
    technicianId: string
  } | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [kpiFilter, setKpiFilter] = useState<string | null>(null)

  const weekStart = useMemo(() => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - date.getDay())
    date.setHours(0, 0, 0, 0)
    return date
  }, [currentDate])

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      return date
    })
  }, [weekStart])

  const filteredOrders = useMemo(() => {
    if (selectedTechnician === 'all') return workOrders
    return workOrders.filter(order => order.technician?.id === selectedTechnician)
  }, [workOrders, selectedTechnician])

  const ordersByDateAndTech = useMemo(() => {
    const grouped: Record<string, Record<string, WorkOrder[]>> = {}
    
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.scheduledDate)
      const dateKey = orderDate.toDateString()
      const techId = order.technician?.id || 'unassigned'
      
      if (!grouped[dateKey]) grouped[dateKey] = {}
      if (!grouped[dateKey][techId]) grouped[dateKey][techId] = []
      
      grouped[dateKey][techId].push(order)
    })
    
    return grouped
  }, [filteredOrders])

  const unassignedOrders = useMemo(() => {
    let filtered = workOrders.filter(order => !order.technician && order.status !== 'completed')
    
    // KPI filter takes priority
    if (kpiFilter === 'inProgress') {
      filtered = workOrders.filter(order => order.status === 'in-progress')
    } else if (kpiFilter === 'completedToday') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = workOrders.filter(o => {
        const orderDate = new Date(o.scheduledDate)
        orderDate.setHours(0, 0, 0, 0)
        return o.status === 'completed' && orderDate.getTime() === today.getTime()
      })
    } else if (kpiFilter === 'all') {
      filtered = workOrders
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === priorityFilter)
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(order => order.category === categoryFilter)
    }
    
    return filtered
  }, [workOrders, priorityFilter, categoryFilter, kpiFilter])
  
  const categories = useMemo(() => {
    const cats = new Set(workOrders.map(order => order.category))
    return Array.from(cats)
  }, [workOrders])
  
  const kpiMetrics = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const totalOrders = workOrders.length
    const inProgress = workOrders.filter(o => o.status === 'in-progress').length
    const completedToday = workOrders.filter(o => {
      const orderDate = new Date(o.scheduledDate)
      orderDate.setHours(0, 0, 0, 0)
      return o.status === 'completed' && orderDate.getTime() === today.getTime()
    }).length
    
    const completedOrders = workOrders.filter(o => o.status === 'completed')
    const avgRating = completedOrders.length > 0
      ? (completedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / completedOrders.length).toFixed(1)
      : '0.0'
    
    return { totalOrders, inProgress, completedToday, avgRating }
  }, [workOrders])
  
  const getTechStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500'
      case 'busy':
        return 'bg-yellow-500'
      case 'on-break':
        return 'bg-orange-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }
  
  const getTechStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'busy':
        return 'Busy'
      case 'on-break':
        return 'Off'
      case 'offline':
        return 'Offline'
      default:
        return status
    }
  }

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDragStart = (e: React.DragEvent, order: WorkOrder) => {
    setDraggedOrder(order)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedOrder(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, date: Date, technicianId: string) => {
    e.preventDefault()
    if (!draggedOrder) return

    // Check for time conflicts
    const technician = technicians.find(t => t.id === technicianId)
    if (!technician) {
      toast.error('Technician not found')
      setDraggedOrder(null)
      return
    }

    const dateKey = date.toDateString()
    const existingOrders = ordersByDateAndTech[dateKey]?.[technicianId] || []
    
    if (existingOrders.length > 0) {
      const hasConflict = existingOrders.some(_order => {
        return true // Simplified conflict check
      })
      
      if (hasConflict) {
        toast.error(`⚠️ Time Conflict: ${technician.name} already has an order at this time`)
        setDraggedOrder(null)
        return
      }
    }

    setPendingSchedule({
      order: draggedOrder,
      date,
      technicianId,
    })
    setShowTimeModal(true)
    setDraggedOrder(null)
  }

  const handleConfirmSchedule = (timeSlot: 'morning' | 'afternoon') => {
    if (!pendingSchedule) return

    const technician = technicians.find(t => t.id === pendingSchedule.technicianId)
    const newDate = new Date(pendingSchedule.date)
    
    if (timeSlot === 'morning') {
      newDate.setHours(9, 0, 0, 0)
    } else {
      newDate.setHours(14, 0, 0, 0)
    }
    
    updateWorkOrder(pendingSchedule.order.id, {
      scheduledDate: newDate.toISOString(),
      technician: technician || undefined,
      status: technician ? 'assigned' : pendingSchedule.order.status,
    })

    toast.success(`Assigned to ${technician?.name || 'Unknown'} - ${timeSlot === 'morning' ? 'Morning' : 'Afternoon'} slot`)
    
    setShowTimeModal(false)
    setPendingSchedule(null)
  }

  const handleCancelSchedule = () => {
    setShowTimeModal(false)
    setPendingSchedule(null)
  }

  const handleUnassignOrder = (orderId: string) => {
    updateWorkOrder(orderId, {
      technician: undefined,
      status: 'pending',
    })
    toast.success('Assignment removed')
  }

  const handleOrderClick = (order: WorkOrder) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handleKpiClick = (filter: string) => {
    setKpiFilter(kpiFilter === filter ? null : filter)
  }

  return (
    <div className="space-y-0">
      <Toaster 
        position="top-right" 
        toastOptions={{
          success: {
            style: {
              background: '#f0fdf4',
              color: '#166534',
            },
          },
        }}
      />
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('schedule')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'schedule'
                ? 'text-cyan-600 dark:text-cyan-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            <Calendar className="h-4 w-4" />
            Schedule Calendar
            {activeTab === 'schedule' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600 dark:bg-cyan-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'dashboard'
                ? 'text-cyan-600 dark:text-cyan-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
            {activeTab === 'dashboard' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600 dark:bg-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' ? (
        <Dashboard />
      ) : (
        <div>
          {/* Schedule Content */}
          {/* Top Bar - Header Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
        <div className="flex items-center justify-between">
          {/* Left: Title + Subtitle */}
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Technician Schedule</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-0.5 text-xs">
                Drag work orders to assign technicians
              </p>
            </div>
            <div className="group relative">
              <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-semibold cursor-help">
                ?
              </div>
              <div className="absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <p className="font-semibold mb-1">How to use drag & drop scheduling:</p>
                <ul className="space-y-1 text-gray-300">
                  <li>• Drag work orders from the left panel</li>
                  <li>• Drop into calendar cells to assign</li>
                  <li>• System checks for time conflicts</li>
                  <li>• Set specific time after dropping</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Right: Navigation + Date Range + Technician Filter */}
          <div className="flex items-center gap-3">
            {/* Date Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition shadow"
              >
                Today
              </button>
              <button
                onClick={handleNextWeek}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Current Month Display */}
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>

            {/* Technician Filter */}
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white text-xs"
            >
              <option value="all">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>{tech.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Cards - 4 horizontal cards */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <button
            onClick={() => handleKpiClick('all')}
            className={cn(
              "rounded-lg p-2 shadow-sm flex items-center justify-center transition-all cursor-pointer hover:shadow-md",
              kpiFilter === 'all' ? 'ring-2 ring-cyan-500' : '',
              "bg-[#EEF4FF]"
            )}
          >
            <div className="text-center">
              <div className="text-xl font-bold text-[#1E40AF]">{kpiMetrics.totalOrders}</div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Total Orders</div>
            </div>
          </button>
          <button
            onClick={() => handleKpiClick('inProgress')}
            className={cn(
              "rounded-lg p-2 shadow-sm flex items-center justify-center transition-all cursor-pointer hover:shadow-md",
              kpiFilter === 'inProgress' ? 'ring-2 ring-cyan-500' : '',
              "bg-[#FFF3ED]"
            )}
          >
            <div className="text-center">
              <div className="text-xl font-bold text-[#9A3412]">{kpiMetrics.inProgress}</div>
              <div className="text-[10px] text-[#64748B] mt-0.5">In Progress</div>
            </div>
          </button>
          <button
            onClick={() => handleKpiClick('completedToday')}
            className={cn(
              "rounded-lg p-2 shadow-sm flex items-center justify-center transition-all cursor-pointer hover:shadow-md",
              kpiFilter === 'completedToday' ? 'ring-2 ring-cyan-500' : '',
              "bg-[#ECFDF3]"
            )}
          >
            <div className="text-center">
              <div className="text-xl font-bold text-[#065F46]">{kpiMetrics.completedToday}</div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Completed Today</div>
            </div>
          </button>
          <div className="bg-[#F5F0FF] rounded-lg p-2 shadow-sm flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold text-[#5B21B6]">{kpiMetrics.avgRating}</div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Left Sidebar (240px fixed) + Right Calendar (flex-1) */}
      <div className="flex gap-3 h-[calc(100vh-220px)]">
        {/* Left Sidebar - Fixed 240px width, no KPI */}
        <div className="w-[240px] flex-shrink-0">
          {/* Unassigned Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2 text-sm">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                Unassigned Orders
                <span className="ml-auto bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                  ({unassignedOrders.length})
                </span>
              </h3>
              
              {/* Filters - two rows */}
              <div className="space-y-1.5">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-2 py-1 text-[11px] border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="high">High</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-2 py-1 text-[11px] border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Types</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-2 space-y-1.5 overflow-y-auto flex-1">
              {unassignedOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-xs">
                  No unassigned orders
                </div>
              ) : (
                unassignedOrders.map((order) => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleOrderClick(order)}
                    className={cn(
                      'p-2 rounded border-2 cursor-move transition-all hover:scale-[1.02] hover:shadow-lg text-[11px]',
                      order.priority === 'urgent' && 'bg-[#FDECEC] border-[#EF4444] text-[#991B1B]',
                      order.priority === 'high' && 'bg-[#F1F5FF] border-[#6366F1] text-[#3730A3]',
                      order.priority === 'medium' && 'bg-[#FFF4E5] border-[#F97316] text-[#9A3412]',
                      order.priority === 'low' && 'bg-[#ECFDF3] border-[#22C55E] text-[#166534]'
                    )}
                  >
                    <div className="font-semibold mb-0.5 line-clamp-1">
                      {order.title}
                    </div>
                    <div className="opacity-90 mb-0.5 font-medium">
                      {order.customer.name}
                    </div>
                    <div className="opacity-80 mb-1 line-clamp-2">
                      {order.location.address}
                    </div>
                    <div className="flex items-center justify-between opacity-90">
                      <span className="flex items-center gap-0.5 text-[#64748B]">
                        <Clock className="h-2.5 w-2.5" />
                        {order.estimatedDuration}h
                      </span>
                      <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-black/5 text-[#64748B]">
                        {order.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Calendar Area - Takes remaining space */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
          {/* Calendar Grid */}
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20">
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="sticky left-0 z-30 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b-2 border-gray-300 dark:border-gray-600 min-w-[140px]">
                      Technician
                    </th>
                    {weekDays.map((date, i) => {
                      const isToday = date.toDateString() === new Date().toDateString()
                      return (
                        <th
                          key={i}
                          className={cn(
                            'px-3 py-2 text-center text-xs font-semibold border-b-2 border-gray-300 dark:border-gray-600 min-w-[140px]',
                            isToday
                              ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                              : 'text-gray-700 dark:text-gray-300'
                          )}
                        >
                          <div className="font-bold">{DAYS_OF_WEEK[i]}</div>
                          <div className="text-[10px] font-normal mt-0.5 opacity-80">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {technicians.map((tech) => {
                    if (selectedTechnician !== 'all' && tech.id !== selectedTechnician) {
                      return null
                    }
                    
                    return (
                      <tr key={tech.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-4 py-2 border-r border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            {tech.avatar ? (
                              <img 
                                src={tech.avatar} 
                                alt={tech.name}
                                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                                {tech.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white text-xs">{tech.name}</div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  getTechStatusColor(tech.status)
                                )} />
                                <span className="text-[10px] text-gray-600 dark:text-gray-400">
                                  {getTechStatusLabel(tech.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        {weekDays.map((date, i) => {
                          const dateKey = date.toDateString()
                          const orders = ordersByDateAndTech[dateKey]?.[tech.id] || []
                          const isToday = date.toDateString() === new Date().toDateString()
                          
                          return (
                            <td
                              key={i}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, date, tech.id)}
                              className={cn(
                                'px-2 py-2 align-top',
                                isToday && 'bg-cyan-50/30 dark:bg-cyan-900/10'
                              )}
                            >
                              <div className="space-y-1.5 min-h-[80px]">
                                {orders.length === 0 ? (
                                  <div className="text-[10px] text-gray-400 dark:text-gray-500 italic text-center py-6">
                                    Drop order here
                                  </div>
                                ) : (
                                  orders.map((order) => (
                                    <div
                                      key={order.id}
                                      onClick={() => handleOrderClick(order)}
                                      className={cn(
                                        'group relative p-2 rounded border-2 text-[11px] transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer',
                                        order.priority === 'urgent' && 'bg-[#FDECEC] border-[#EF4444] text-[#991B1B]',
                                        order.priority === 'high' && 'bg-[#F1F5FF] border-[#6366F1] text-[#3730A3]',
                                        order.priority === 'medium' && 'bg-[#FFF4E5] border-[#F97316] text-[#9A3412]',
                                        order.priority === 'low' && 'bg-[#ECFDF3] border-[#22C55E] text-[#166534]'
                                      )}
                                    >
                                      {/* Delete/Unassign button */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleUnassignOrder(order.id)
                                        }}
                                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
                                        title="Unassign order"
                                      >
                                        <X className="h-2.5 w-2.5 text-white" />
                                      </button>
                                      
                                      <div className="font-semibold mb-0.5 line-clamp-1">{order.title}</div>
                                      <div className="opacity-90 mb-0.5 font-medium">{order.customer.name}</div>
                                      <div className="opacity-80 line-clamp-2 mb-1">
                                        {order.location.address}
                                      </div>
                                      <div className="flex items-center justify-between opacity-90">
                                        <span className="flex items-center gap-0.5 text-[#64748B]">
                                          <Clock className="h-2.5 w-2.5" />
                                          {order.estimatedDuration}h
                                        </span>
                                        <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-black/5 text-[#64748B]">
                                          {order.priority}
                                        </span>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Time Selection Modal */}
      {showTimeModal && pendingSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select Time Slot
              </h3>
              <button
                onClick={handleCancelSchedule}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Order:</strong> {pendingSchedule.order.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Date:</strong> {pendingSchedule.date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleConfirmSchedule('morning')}
                className="w-full p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl">
                    ☀️
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Morning Slot</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">9:00 AM - 12:00 PM</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              <button
                onClick={() => handleConfirmSchedule('afternoon')}
                className="w-full p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl">
                    🌤️
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Afternoon Slot</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">2:00 PM - 5:00 PM</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Work Order Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Priority Badge */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  selectedOrder.priority === 'urgent' && 'bg-[#FDECEC] text-[#991B1B]',
                  selectedOrder.priority === 'high' && 'bg-[#F1F5FF] text-[#3730A3]',
                  selectedOrder.priority === 'medium' && 'bg-[#FFF4E5] text-[#9A3412]',
                  selectedOrder.priority === 'low' && 'bg-[#ECFDF3] text-[#166534]'
                )}>
                  {selectedOrder.priority.toUpperCase()}
                </span>
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  selectedOrder.status === 'completed' && 'bg-green-100 text-green-800',
                  selectedOrder.status === 'in-progress' && 'bg-blue-100 text-blue-800',
                  selectedOrder.status === 'assigned' && 'bg-yellow-100 text-yellow-800',
                  selectedOrder.status === 'pending' && 'bg-gray-100 text-gray-800'
                )}>
                  {selectedOrder.status.toUpperCase()}
                </span>
              </div>

              {/* Title */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedOrder.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedOrder.description}
                </p>
              </div>

              {/* Customer */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CUSTOMER</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedOrder.customer.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.customer.phone}</p>
              </div>

              {/* Location */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">LOCATION</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedOrder.location.address}</p>
              </div>

              {/* Schedule */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">SCHEDULE</p>
                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(selectedOrder.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span>{selectedOrder.estimatedDuration}h duration</span>
                </div>
              </div>

              {/* Technician */}
              {selectedOrder.technician && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ASSIGNED TECHNICIAN</p>
                  <div className="flex items-center gap-2">
                    {selectedOrder.technician.avatar ? (
                      <img 
                        src={selectedOrder.technician.avatar} 
                        alt={selectedOrder.technician.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {selectedOrder.technician.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedOrder.technician.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{selectedOrder.technician.skills.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category & Rating */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CATEGORY</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedOrder.category}</p>
                </div>
                {selectedOrder.rating && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">RATING</p>
                    <p className="text-sm text-gray-900 dark:text-white">⭐ {selectedOrder.rating}/5</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
