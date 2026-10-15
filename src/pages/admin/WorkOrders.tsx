import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Clock, 
  User,
  Edit,
  Trash2,
  X,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkOrderStatus, WorkOrderPriority, WorkOrder } from '@/types'
import AdvancedFilters, { FilterValues } from '@/components/AdvancedFilters'
import BatchActions from '@/components/BatchActions'
import ColumnCustomizer, { ColumnConfig } from '@/components/ColumnCustomizer'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'select', label: 'Select', visible: true },
  { id: 'id', label: 'Order ID', visible: true },
  { id: 'title', label: 'Title', visible: true },
  { id: 'customer', label: 'Customer', visible: true },
  { id: 'technician', label: 'Technician', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'priority', label: 'Priority', visible: true },
  { id: 'category', label: 'Category', visible: true },
  { id: 'scheduledDate', label: 'Scheduled', visible: true },
  { id: 'actions', label: 'Actions', visible: true },
]

export default function WorkOrders() {
  const { workOrders, addWorkOrder, updateWorkOrder, deleteWorkOrder, customers, technicians, batchUpdateWorkOrders, batchDeleteWorkOrders, batchAssignTechnician } = useStore()
  
  const [filters, setFilters] = useState<FilterValues>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    technicianId: 'all',
    dateRange: { start: '', end: '' },
    category: 'all',
  })
  
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  const categories = Array.from(new Set(workOrders.map(o => o.category)))

  const filteredOrders = workOrders.filter((order) => {
    const matchesSearch = 
      order.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      order.category.toLowerCase().includes(filters.searchTerm.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || order.status === filters.status
    const matchesPriority = filters.priority === 'all' || order.priority === filters.priority
    const matchesTechnician = filters.technicianId === 'all' || order.technician?.id === filters.technicianId
    const matchesCategory = filters.category === 'all' || order.category === filters.category
    
    // Date range filter
    let matchesDateRange = true
    if (filters.dateRange.start || filters.dateRange.end) {
      const orderDate = new Date(order.scheduledDate)
      if (filters.dateRange.start) {
        matchesDateRange = matchesDateRange && orderDate >= new Date(filters.dateRange.start)
      }
      if (filters.dateRange.end) {
        matchesDateRange = matchesDateRange && orderDate <= new Date(filters.dateRange.end)
      }
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesTechnician && matchesCategory && matchesDateRange
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  // Stats
  const stats = {
    total: workOrders.length,
    pending: workOrders.filter(o => o.status === 'pending').length,
    inProgress: workOrders.filter(o => o.status === 'in-progress').length,
    completed: workOrders.filter(o => o.status === 'completed').length,
  }

  const handleSelectAll = () => {
    if (selectedOrders.size === paginatedOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(paginatedOrders.map(o => o.id)))
    }
  }

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const handleNewOrder = () => {
    setEditingOrder(null)
    setIsModalOpen(true)
  }

  const handleEditOrder = (order: WorkOrder) => {
    setEditingOrder(order)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (orderId: string) => {
    setDeletingOrderId(orderId)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deletingOrderId) {
      deleteWorkOrder(deletingOrderId)
      setIsDeleteModalOpen(false)
      setDeletingOrderId(null)
      toast.success('Order deleted successfully')
    }
  }

  const handleBatchUpdateStatus = async (status: any) => {
    const ids = Array.from(selectedOrders)
    batchUpdateWorkOrders(ids, { status })
    setSelectedOrders(new Set())
    toast.success(`Updated ${ids.length} orders`)
  }

  const handleBatchAssignTechnician = async (technicianId: string) => {
    const ids = Array.from(selectedOrders)
    batchAssignTechnician(ids, technicianId)
    setSelectedOrders(new Set())
    const tech = technicians.find(t => t.id === technicianId)
    toast.success(`Assigned ${ids.length} orders to ${tech?.name}`)
  }

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedOrders)
    batchDeleteWorkOrders(ids)
    setSelectedOrders(new Set())
    toast.success(`Deleted ${ids.length} orders`)
  }

  const handleBatchExport = () => {
    const selectedData = workOrders.filter(o => selectedOrders.has(o.id))
    const csv = [
      ['ID', 'Title', 'Customer', 'Status', 'Priority', 'Category', 'Scheduled Date'].join(','),
      ...selectedData.map(o => [
        o.id,
        o.title,
        o.customer.name,
        o.status,
        o.priority,
        o.category,
        o.scheduledDate
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success(`Exported ${selectedOrders.size} orders`)
  }

  const visibleColumns = columns.filter(c => c.visible)

  const handleSaveOrder = (orderData: any) => {
    if (editingOrder) {
      updateWorkOrder(editingOrder.id, orderData)
    } else {
      addWorkOrder(orderData)
      setCurrentPage(1) // Go to first page to see new order
    }
    setIsModalOpen(false)
    setSelectedOrders(new Set())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Work Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all work orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ColumnCustomizer 
            columns={columns}
            onColumnsChange={setColumns}
            storageKey="work-orders-columns"
          />
          <button
            onClick={handleNewOrder}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            New Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        technicians={technicians.map(t => ({ id: t.id, name: t.name }))}
        categories={categories}
      />

      {/* Batch Actions */}
      <BatchActions
        selectedCount={selectedOrders.size}
        onBatchUpdateStatus={handleBatchUpdateStatus}
        onBatchAssignTechnician={handleBatchAssignTechnician}
        onBatchDelete={handleBatchDelete}
        onBatchExport={handleBatchExport}
        onClearSelection={() => setSelectedOrders(new Set())}
        technicians={technicians}
      />

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {visibleColumns.map((col) => (
                  <th 
                    key={col.id} 
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase",
                      col.id === 'select' && "w-12",
                      col.id === 'actions' && "text-right"
                    )}
                  >
                    {col.id === 'select' ? (
                      <button onClick={handleSelectAll} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        {selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0 ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {visibleColumns.map((col) => {
                    // Select checkbox
                    if (col.id === 'select') {
                      return (
                        <td key={col.id} className="px-4 py-4">
                          <button 
                            onClick={() => handleSelectOrder(order.id)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          >
                            {selectedOrders.has(order.id) ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                      )
                    }
                    // Order ID
                    if (col.id === 'id') {
                      return (
                        <td key={col.id} className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          #{order.id.slice(0, 8)}
                        </td>
                      )
                    }
                    // Title
                    if (col.id === 'title') {
                      return (
                        <td key={col.id} className="px-4 py-4">
                          <Link 
                            to={`/admin/work-orders/${order.id}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-blue-600"
                          >
                            {order.title}
                          </Link>
                        </td>
                      )
                    }
                    // Customer
                    if (col.id === 'customer') {
                      return (
                        <td key={col.id} className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {order.customer.name}
                        </td>
                      )
                    }
                    // Technician
                    if (col.id === 'technician') {
                      return (
                        <td key={col.id} className="px-4 py-4">
                          {order.technician ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <User className="h-4 w-4" />
                              {order.technician.name}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          )}
                        </td>
                      )
                    }
                    // Status
                    if (col.id === 'status') {
                      return (
                        <td key={col.id} className="px-4 py-4">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            order.status === 'completed' && 'bg-green-100 text-green-800',
                            order.status === 'in-progress' && 'bg-blue-100 text-blue-800',
                            order.status === 'assigned' && 'bg-purple-100 text-purple-800',
                            order.status === 'pending' && 'bg-yellow-100 text-yellow-800'
                          )}>
                            {order.status}
                          </span>
                        </td>
                      )
                    }
                    // Priority
                    if (col.id === 'priority') {
                      return (
                        <td key={col.id} className="px-4 py-4">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            order.priority === 'urgent' && 'bg-red-100 text-red-800',
                            order.priority === 'high' && 'bg-orange-100 text-orange-800',
                            order.priority === 'medium' && 'bg-yellow-100 text-yellow-800',
                            order.priority === 'low' && 'bg-gray-100 text-gray-800'
                          )}>
                            {order.priority}
                          </span>
                        </td>
                      )
                    }
                    // Category
                    if (col.id === 'category') {
                      return (
                        <td key={col.id} className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {order.category}
                        </td>
                      )
                    }
                    // Scheduled Date
                    if (col.id === 'scheduledDate') {
                      return (
                        <td key={col.id} className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            {new Date(order.scheduledDate).toLocaleDateString()}
                          </div>
                        </td>
                      )
                    }
                    // Actions
                    if (col.id === 'actions') {
                      return (
                        <td key={col.id} className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(order.id)}
                              className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )
                    }
                    return null
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <OrderModal
          order={editingOrder}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveOrder}
          customers={customers}
          technicians={technicians}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}

// Simplified Order Modal - Only 6 key fields
function OrderModal({
  order,
  onClose,
  onSave,
  customers,
  technicians,
}: {
  order: WorkOrder | null
  onClose: () => void
  onSave: (data: Partial<WorkOrder>) => void
  customers: any[]
  technicians: any[]
}) {
  const [formData, setFormData] = useState({
    title: order?.title || '',
    customerId: order?.customer.id || '',
    technicianId: order?.technician?.id || '',
    priority: order?.priority || 'medium' as WorkOrderPriority,
    status: order?.status || 'pending' as WorkOrderStatus,
    scheduledDate: order?.scheduledDate ? new Date(order.scheduledDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  })

  const [images, setImages] = useState<string[]>(order?.attachments || [])
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploadingImage(true)
    
    // Convert images to base64
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string])
          setUploadingImage(false)
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const customer = customers.find(c => c.id === formData.customerId)
    const technician = technicians.find(t => t.id === formData.technicianId)
    
    if (!customer) return

    const orderData: Partial<WorkOrder> = {
      title: formData.title,
      priority: formData.priority,
      status: formData.status,
      customer,
      technician: technician || undefined,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
      attachments: images,
    }

    // Add default values for new orders
    if (!order) {
      Object.assign(orderData, {
        description: `Work order for ${customer.name}`,
        category: 'repair',
        location: customer.location,
        estimatedDuration: 2,
        notes: [],
      })
    }

    onSave(orderData)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {order ? 'Edit Work Order' : 'New Work Order'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. Fix AC Unit"
                required
              />
            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Technician */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign Technician
              </label>
              <select
                value={formData.technicianId}
                onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Unassigned</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as WorkOrderPriority })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkOrderStatus })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scheduled Date *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attachments (Optional)
              </label>
              
              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Upload Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {uploadingImage && (
                  <span className="text-sm text-gray-500">Uploading...</span>
                )}
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Upload multiple images (PNG, JPG, GIF). Optional field.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {order ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
function DeleteConfirmationModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delete Work Order
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this work order? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
