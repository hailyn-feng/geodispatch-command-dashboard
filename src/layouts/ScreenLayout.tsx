import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'

export default function ScreenLayout() {
  // Force dark mode for screen
  useEffect(() => {
    document.documentElement.classList.add('dark')
    // Prevent body scrolling
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.classList.remove('dark')
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <div className="h-screen bg-gray-900 overflow-hidden">
      {/* Page content - no header, let child components control layout */}
      <main className="h-full">
        <Outlet />
      </main>
    </div>
  )
}
