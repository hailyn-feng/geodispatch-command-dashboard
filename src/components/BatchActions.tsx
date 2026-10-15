import { useState } from 'react'
import { CheckSquare, Trash2, UserPlus, RefreshCw, Download, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkOrderStatus, Technician } from '@/types'
import toast from 'react-hot-toast'

interface BatchActionsProps {
  selectedCount: number
  onBatchUpdateStatus: (status: WorkOrderStatus) => Promise<void>
  onBatchAssignTechnician: (technicianId: string) => Promise<void>
  onBatchDelete: () => Promise<void>
  onBatchExport: () => void
  onClearSelection: () => void
  technicians: Technician[]
  className?: string
}

export default function BatchActions({
  selectedCount,
  onBatchUpdateStatus,
  onBatchAssignTechnician,
  onBatchDelete,
  onBatchExport,
  onClearSelection,
  technicians,
  className,
}: BatchActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showTechMenu, setShowTechMenu] = useState(false)

  if (selectedCount === 0) return null

  const handleBatchUpdateStatus = async (status: WorkOrderStatus) => {
    setIsProcessing(true)
    try {
      await onBatchUpdateStatus(status)
      toast.success(`Updated ${selectedCount} order(s) to ${status}`)
      setShowStatusMenu(false)
    } catch (error) {
      toast.error('Failed to update orders')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBatchAssignTechnician = async (technicianId: string) => {
    setIsProcessing(true)
    try {
      await onBatchAssignTechnician(technicianId)
      const tech = technicians.find(t => t.id === technicianId)
      toast.success(`Assigned ${selectedCount} order(s) to ${tech?.name}`)
      setShowTechMenu(false)
    } catch (error) {
      toast.error('Failed to assign technician')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBatchDelete = async () => {
    setIsProcessing(true)
    try {
      await onBatchDelete()
      toast.success(`Deleted ${selectedCount} order(s)`)
      setShowDeleteConfirm(false)
    } catch (error) {
      toast.error('Failed to delete orders')
    } finally {
      setIsProcessing(false)
    }
  }

  const availableTechs = technicians.filter(t => t.status === 'available' || t.status === 'busy')

  return (
    <>
      <div className={cn(
        'fixed bottom-8 left-1/2 -translate-x-1/2 z-50',
        'bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-blue-500',
        'px-6 py-4 flex items-center gap-4',
        'animate-slideUp',
        className
      )}>
        {/* Selection Info */}
        <div className="flex items-center gap-3 pr-4 border-r border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
            <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedCount} {selectedCount === 1 ? 'order' : 'orders'} selected
            </p>
            <button
              onClick={onClearSelection}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear selection
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Update Status */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={isProcessing}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                'bg-blue-600 text-white hover:bg-blue-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <RefreshCw className={cn('h-4 w-4', isProcessing && 'animate-spin')} />
              <span>Update Status</span>
            </button>

            {showStatusMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Change Status To
                </div>
                {[
                  { value: 'pending' as WorkOrderStatus, label: 'Pending', color: 'bg-yellow-500' },
                  { value: 'assigned' as WorkOrderStatus, label: 'Assigned', color: 'bg-purple-500' },
                  { value: 'in-progress' as WorkOrderStatus, label: 'In Progress', color: 'bg-blue-500' },
                  { value: 'completed' as WorkOrderStatus, label: 'Completed', color: 'bg-green-500' },
                  { value: 'cancelled' as WorkOrderStatus, label: 'Cancelled', color: 'bg-gray-500' },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleBatchUpdateStatus(status.value)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={cn('w-3 h-3 rounded-full', status.color)} />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{status.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assign Technician */}
          <div className="relative">
            <button
              onClick={() => setShowTechMenu(!showTechMenu)}
              disabled={isProcessing}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                'bg-purple-600 text-white hover:bg-purple-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <UserPlus className="h-4 w-4" />
              <span>Assign</span>
            </button>

            {showTechMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 max-h-80 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Assign To Technician
                </div>
                {availableTechs.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No available technicians
                  </div>
                ) : (
                  availableTechs.map((tech) => (
                    <button
                      key={tech.id}
                      onClick={() => handleBatchAssignTechnician(tech.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <img
                        src={tech.avatar}
                        alt={tech.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {tech.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {tech.assignedOrders} active orders
                        </p>
                      </div>
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        tech.status === 'available' && 'bg-green-500',
                        tech.status === 'busy' && 'bg-yellow-500'
                      )} />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Export */}
          <button
            onClick={onBatchExport}
            disabled={isProcessing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              'bg-green-600 text-white hover:bg-green-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isProcessing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              'bg-red-600 text-white hover:bg-red-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 animate-scaleIn">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete {selectedCount} order(s)?
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBatchDelete}
                  disabled={isProcessing}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
