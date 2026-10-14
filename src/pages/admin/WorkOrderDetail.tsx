import { useParams, Link } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { ArrowLeft, MapPin, Clock, User, Phone, Mail, Calendar, FileText, CheckCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { workOrders, updateWorkOrder } = useStore()
  const order = workOrders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Work order not found</p>
        <Link
          to="/work-orders"
          className="text-primary-600 dark:text-primary-400 hover:underline mt-4 inline-block"
        >
          Back to work orders
        </Link>
      </div>
    )
  }

  const statusOptions: Array<{ value: typeof order.status; label: string; color: string }> = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
    { value: 'assigned', label: 'Assigned', color: 'bg-purple-500' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/work-orders"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to work orders
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{order.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Order #{order.id}</p>
          </div>
          <span className={cn(
            'px-3 py-1 text-sm font-medium rounded',
            order.priority === 'urgent' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            order.priority === 'high' && 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            order.priority === 'medium' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            order.priority === 'low' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
          )}>
            {order.priority} priority
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status
            </h2>
            <div className="flex items-center gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => updateWorkOrder(order.id, { status: status.value })}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    order.status === status.value
                      ? `${status.color} text-white`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300">{order.description}</p>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notes
            </h2>
            <ul className="space-y-2">
              {order.notes.map((note, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900 dark:text-white">Scheduled</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(order.scheduledDate)}
                  </p>
                </div>
              </div>

              {order.status === 'in-progress' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {order.completedDate && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-gray-900 dark:text-white">In Progress</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Technician is working on this order
                    </p>
                  </div>
                </div>
              )}

              {order.completedDate && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Completed</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(order.completedDate)}
                    </p>
                    {order.actualDuration && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Duration: {order.actualDuration} minutes
                      </p>
                    )}
                    {order.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium">{order.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{order.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Duration</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{order.estimatedDuration} minutes</p>
              </div>
              {order.actualDuration && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Actual Duration</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{order.actualDuration} minutes</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.customer.name}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                {order.customer.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                {order.customer.email}
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {order.customer.address}
              </div>
              <div className="pt-2 border-t dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Orders</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {order.customer.totalOrders}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Rating</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ⭐ {order.customer.rating}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Technician */}
          {order.technician && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Assigned Technician
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={order.technician.avatar}
                    alt={order.technician.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.technician.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {order.technician.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4" />
                  {order.technician.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  {order.technician.email}
                </div>
                <div className="pt-2 border-t dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {order.technician.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Rating</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ⭐ {order.technician.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </h2>
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              {order.location.address}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
