import { useState, useEffect } from 'react'
import { Settings, Eye, EyeOff, GripVertical, RotateCcw } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

export interface ColumnConfig {
  id: string
  label: string
  visible: boolean
  width?: number
}

interface ColumnCustomizerProps {
  columns: ColumnConfig[]
  onColumnsChange: (columns: ColumnConfig[]) => void
  storageKey?: string
  className?: string
}

function SortableColumnItem({ column, onToggle }: { column: ColumnConfig; onToggle: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </button>
      
      <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">
        {column.label}
      </span>
      
      <button
        onClick={() => onToggle(column.id)}
        className={cn(
          'p-1 rounded transition-colors',
          column.visible
            ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
      >
        {column.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default function ColumnCustomizer({
  columns: initialColumns,
  onColumnsChange,
  storageKey = 'table-columns',
  className,
}: ColumnCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [columns, setColumns] = useState<ColumnConfig[]>(initialColumns)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setColumns(parsed)
        onColumnsChange(parsed)
      } catch (e) {
        console.error('Failed to parse stored columns:', e)
      }
    }
  }, [])

  // Save to localStorage when columns change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(columns))
    onColumnsChange(columns)
  }, [columns])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleToggle = (id: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === id ? { ...col, visible: !col.visible } : col
      )
    )
  }

  const handleReset = () => {
    setColumns(initialColumns)
    localStorage.removeItem(storageKey)
  }

  const visibleCount = columns.filter((c) => c.visible).length

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Settings className="h-4 w-4" />
        <span className="text-sm font-medium">Columns</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({visibleCount}/{columns.length})
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-slideDown">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Customize Columns
                </h3>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="Reset to default"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Drag to reorder • Click eye to show/hide
              </p>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columns.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {columns.map((column) => (
                      <SortableColumnItem
                        key={column.id}
                        column={column}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>
                  {visibleCount} column{visibleCount !== 1 ? 's' : ''} visible
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
