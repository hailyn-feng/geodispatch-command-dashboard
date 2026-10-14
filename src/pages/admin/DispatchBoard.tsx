import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '@/store/useStore'
import { Clock, User, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkOrder, WorkOrderStatus } from '@/types'

const COLUMNS: { id: WorkOrderStatus; title: string; color: string }[] = [
  { id: 'pending', title: 'Pending', color: 'bg-yellow-500' },
  { id: 'assigned', title: 'Assigned', color: 'bg-purple-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'completed', title: 'Completed', color: 'bg-green-500' },
]

export default function DispatchBoard() {
  const { workOrders, updateWorkOrder } = useStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    order: WorkOrder
    newStatus: WorkOrderStatus
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // Don't update during drag - we'll confirm on drop
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    
    if (!over) return

    const activeOrder = workOrders.find((o) => o.id === active.id)
    const overColumnId = over.id as WorkOrderStatus

    // Check if dragging over a column (either column container or stat card)
    if (COLUMNS.some((col) => col.id === overColumnId)) {
      if (activeOrder && activeOrder.status !== overColumnId) {
        // Show confirmation dialog
        setConfirmDialog({
          order: activeOrder,
          newStatus: overColumnId,
        })
      }
    }
  }

  const handleConfirmStatusChange = () => {
    if (confirmDialog) {
      updateWorkOrder(confirmDialog.order.id, { status: confirmDialog.newStatus })
      setConfirmDialog(null)
    }
  }

  const handleCancelStatusChange = () => {
    setConfirmDialog(null)
  }

  const activeOrder = workOrders.find((o) => o.id === activeId)

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dispatch Board</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Drag and drop work orders between columns to update their status
        </p>
      </div>

      {/* Usage Hint Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 dark:text-blue-400 text-xl">💡</div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              How to use Dispatch Board
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• <strong>Drag cards between columns</strong> to change work order status</li>
              <li>• <strong>Drop on stat cards at top</strong> for quick status updates</li>
              <li>• <strong>Confirm changes</strong> in the popup dialog before applying</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Kanban Board with Stats */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Stats - Droppable */}
        <SortableContext items={COLUMNS.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="grid gap-3 md:grid-cols-4">
            {COLUMNS.map((column) => {
              const count = workOrders.filter((o) => o.status === column.id).length
              return (
                <StatCard 
                  key={column.id} 
                  column={column} 
                  count={count}
                />
              )
            })}
          </div>
        </SortableContext>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              orders={workOrders.filter((o) => o.status === column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeOrder ? <OrderCardOverlay order={activeOrder} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Confirm Status Change
                </h2>
              </div>
              <button
                onClick={handleCancelStatusChange}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Work Order:</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {confirmDialog.order.title}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customer:</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {confirmDialog.order.customer.name}
                  </p>
                </div>

                <div className="pt-3 border-t dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Status:</p>
                      <span className={cn(
                        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                        confirmDialog.order.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                        confirmDialog.order.status === 'assigned' && 'bg-purple-100 text-purple-800',
                        confirmDialog.order.status === 'in-progress' && 'bg-blue-100 text-blue-800',
                        confirmDialog.order.status === 'completed' && 'bg-green-100 text-green-800'
                      )}>
                        {COLUMNS.find(c => c.id === confirmDialog.order.status)?.title}
                      </span>
                    </div>
                    
                    <div className="text-2xl">→</div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Status:</p>
                      <span className={cn(
                        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                        confirmDialog.newStatus === 'pending' && 'bg-yellow-100 text-yellow-800',
                        confirmDialog.newStatus === 'assigned' && 'bg-purple-100 text-purple-800',
                        confirmDialog.newStatus === 'in-progress' && 'bg-blue-100 text-blue-800',
                        confirmDialog.newStatus === 'completed' && 'bg-green-100 text-green-800'
                      )}>
                        {COLUMNS.find(c => c.id === confirmDialog.newStatus)?.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancelStatusChange}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Column({
  column,
  orders,
}: {
  column: { id: WorkOrderStatus; title: string; color: string }
  orders: WorkOrder[]
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[600px]">
      <div className="flex items-center gap-2 mb-4">
        <div className={`${column.color} h-2 w-2 rounded-full`} />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {column.title}
        </h3>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {orders.length}
        </span>
      </div>

      <SortableContext items={orders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </SortableContext>

      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-600">
          <p className="text-sm">No orders</p>
        </div>
      )}
    </div>
  )
}

function OrderCard({ order }: { order: WorkOrder }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-2 border-gray-200 dark:border-gray-700',
        'cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:border-blue-400',
        isDragging && 'opacity-50 cursor-grabbing'
      )}
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
          {order.title}
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <User className="h-3 w-3" />
            <span className="truncate">{order.customer.name}</span>
          </div>
          
          {order.technician && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <User className="h-3 w-3" />
              <span className="truncate">Assigned: {order.technician.name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{new Date(order.scheduledDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              order.priority === 'urgent' && 'bg-red-100 text-red-800',
              order.priority === 'high' && 'bg-orange-100 text-orange-800',
              order.priority === 'medium' && 'bg-yellow-100 text-yellow-800',
              order.priority === 'low' && 'bg-gray-100 text-gray-800'
            )}
          >
            {order.priority}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {order.category}
          </span>
        </div>
      </div>
    </div>
  )
}

function OrderCardOverlay({ order }: { order: WorkOrder }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl border-2 border-blue-500 w-64 rotate-3 scale-105">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
          {order.title}
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <User className="h-3 w-3" />
            <span className="truncate">{order.customer.name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{new Date(order.scheduledDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              order.priority === 'urgent' && 'bg-red-100 text-red-800',
              order.priority === 'high' && 'bg-orange-100 text-orange-800',
              order.priority === 'medium' && 'bg-yellow-100 text-yellow-800',
              order.priority === 'low' && 'bg-gray-100 text-gray-800'
            )}
          >
            {order.priority}
          </span>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  column, 
  count 
}: { 
  column: { id: WorkOrderStatus; title: string; color: string }
  count: number 
}) {
  const { setNodeRef, isOver } = useSortable({ id: column.id })

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-all',
        isOver && 'ring-2 ring-blue-500 scale-105'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{column.title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {count}
          </p>
        </div>
        <div className={`${column.color} h-12 w-12 rounded-lg opacity-20`} />
      </div>
      {isOver && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
          Drop here to update status
        </div>
      )}
    </div>
  )
}
