import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...',
  className 
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2 text-sm text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg",
          "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all",
          "flex items-center justify-between gap-2",
          "hover:bg-gray-50 dark:hover:bg-gray-700"
        )}
      >
        <span className="text-gray-900 dark:text-white truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-gray-400 flex-shrink-0 transition-transform",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>

      {/* Dropdown List - 显示在下方 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-3 py-2 text-sm text-left flex items-center justify-between gap-2",
                "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                value === option.value 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-gray-900 dark:text-white"
              )}
            >
              <span className="truncate">{option.label}</span>
              {value === option.value && (
                <Check className="h-4 w-4 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
