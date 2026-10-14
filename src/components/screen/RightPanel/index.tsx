import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TechnicianView } from './TechnicianView'
import type { Technician } from '@/types'

interface RightPanelProps {
  isOpen: boolean
  onToggle: () => void
  technicians: Technician[]
  selectedTech: string | null
  onTechClick: (techId: string) => void
  isPageVisible?: boolean
}

export function RightPanel({
  isOpen,
  onToggle,
  technicians,
  selectedTech,
  onTechClick,
  isPageVisible = true,
}: RightPanelProps) {
  return (
    <>
      {/* 面板主体 */}
      <div
        className={cn(
          "absolute top-0 right-0 bottom-0 w-80 bg-black/80 backdrop-blur-md border-l border-gray-800 transition-transform duration-300 overflow-hidden flex flex-col",
          !isOpen && "translate-x-full"
        )}
      >
        {/* 内容区 - 不滚动 */}
        <div className="flex-1 p-4 overflow-hidden">
          <TechnicianView
            technicians={technicians}
            onTechClick={onTechClick}
            selectedTech={selectedTech}
            isPageVisible={isPageVisible}
          />
        </div>
      </div>

      {/* 折叠按钮 */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-6 h-12 bg-black/80 backdrop-blur-md border-y border-l border-gray-800 flex items-center justify-center hover:bg-gray-900/80 transition-all z-10",
          isOpen ? "right-80" : "right-0"
        )}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            !isOpen && "rotate-180"
          )}
        />
      </button>
    </>
  )
}
