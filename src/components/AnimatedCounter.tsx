import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 800, className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)
  const frameIdRef = useRef<number | null>(null)

  useEffect(() => {
    const prevValue = prevValueRef.current
    
    if (prevValue === value) return

    const startTime = Date.now()
    const difference = value - prevValue

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuad = (t: number) => t * (2 - t)
      const easedProgress = easeOutQuad(progress)

      const currentValue = Math.round(prevValue + difference * easedProgress)
      setDisplayValue(currentValue)

      if (progress < 1) {
        frameIdRef.current = requestAnimationFrame(animate)
      } else {
        prevValueRef.current = value
        frameIdRef.current = null
      }
    }

    frameIdRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current)
        frameIdRef.current = null
      }
    }
  }, [value, duration])

  return <span className={className}>{displayValue}</span>
}
