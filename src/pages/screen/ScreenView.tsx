import { useState, useEffect } from 'react'
import { Cloud, Monitor, LayoutDashboard } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import ScreenMap from './ScreenMap'
import { useStore } from '@/store/useStore'

export default function ScreenView() {
  const [isPageVisible, setIsPageVisible] = useState(() => document.visibilityState === 'visible')
  const [screenGeneration, setScreenGeneration] = useState(0)
  const [time, setTime] = useState(new Date())
  const navigate = useNavigate()
  const location = useLocation()
  const isScreenMode = location.pathname.startsWith('/screen')
  const { currentUser } = useStore()

  useEffect(() => {
    if (!isPageVisible) return

    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [isPageVisible])

  // 页面可见性管理：切后台停止，返回重新初始化
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible'
      setIsPageVisible(isVisible)
      
      if (isVisible) {
        // 返回大屏时：强制重新初始化整个ScreenMap组件
        setScreenGeneration(prev => prev + 1)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Mock weather data
  const weather = {
    temp: 72,
    condition: 'Partly Cloudy',
    icon: Cloud
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridScroll 20s linear infinite'
        }} />
      </div>

      <style>{`
        @keyframes gridScroll {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>

      <div className="relative z-10 h-full flex flex-col">
        {/* Top Navigation Bar - Increased height for better visibility */}
        <div className="flex items-center justify-between px-6 py-3 flex-shrink-0 bg-gray-900/50 backdrop-blur-md border-b border-cyan-500/20">
          {/* Left: LIVE indicator + Weather + Time - horizontal layout without border */}
          <div className="flex items-center gap-6">
            {/* LIVE */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-cyan-400 font-mono text-sm font-bold">LIVE</span>
            </div>
            
            {/* Weather */}
            <div className="flex items-center gap-2">
              <weather.icon className="h-4 w-4 text-cyan-400" />
              <span className="text-white font-bold text-sm">{weather.temp}°F</span>
              <span className="text-gray-400 text-xs">{weather.condition}</span>
            </div>

            {/* Time & Date */}
            <div className="flex items-center gap-3">
              <span className="text-white font-mono text-sm font-bold">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-gray-400 text-xs">
                {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Center: Title */}
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider whitespace-nowrap">
              GEODISPATCH COMMAND DASHBOARD
            </h1>
            <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2"></div>
          </div>
          
          {/* Right: Mode toggle + User Info */}
          <div className="flex items-center gap-3">
            {/* Hint text + Mode toggle */}
            <div className="flex items-center gap-2">
              {/* Hint text */}
              <span className="text-gray-400 text-[10px] whitespace-nowrap">
                {isScreenMode ? 'Switch to Admin' : 'Switch to Screen'}
              </span>
              
              {/* Mode toggle */}
              <div className="flex items-center gap-0 bg-gray-900/80 backdrop-blur-md rounded-md overflow-hidden border border-cyan-500/30">
                {/* Screen mode: Admin first, Screen second */}
                {isScreenMode ? (
                  <>
                    {/* Admin panel option */}
                    <button
                      onClick={() => navigate('/admin/schedule')}
                      className="relative flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-all duration-300 cursor-pointer text-gray-400 hover:text-white hover:bg-gray-800/50"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 pointer-events-none" />
                      <span className="text-xs pointer-events-none">Admin</span>
                    </button>
                    
                    {/* Separator */}
                    <div className="w-px h-4 bg-gray-700"></div>

                    {/* Screen option */}
                    <button
                      onClick={() => navigate('/screen')}
                      className="relative flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-all duration-300 cursor-default bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                    >
                      <Monitor className="h-3.5 w-3.5 pointer-events-none" />
                      <span className="text-xs pointer-events-none">Screen</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Admin mode: Screen first, Admin second */}
                    {/* Screen option */}
                    <button
                      onClick={() => navigate('/screen')}
                      className="relative flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-all duration-300 cursor-pointer text-gray-400 hover:text-white hover:bg-gray-800/50"
                    >
                      <Monitor className="h-3.5 w-3.5 pointer-events-none" />
                      <span className="text-xs pointer-events-none">Screen</span>
                    </button>
                  
                  {/* Separator */}
                  <div className="w-px h-4 bg-gray-700"></div>

                  {/* Admin panel option */}
                  <button
                    onClick={() => navigate('/admin/schedule')}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-all duration-300 cursor-default bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 pointer-events-none" />
                    <span className="text-xs pointer-events-none">Admin</span>
                  </button>
                </>
              )}
              </div>
            </div>

            {/* Current User Info with Avatar */}
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <img 
                src={currentUser.avatar || 'https://i.pravatar.cc/150?img=1'} 
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-400/50"
              />
              <div className="flex flex-col">
                <span className="text-white text-xs font-semibold">{currentUser.name}</span>
                <span className="text-gray-400 text-[10px]">{currentUser.role === 'admin' ? 'Administrator' : 'Technician'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Full Map View */}
        <div className="flex-1 overflow-hidden">
          {isPageVisible ? (
            <ScreenMap key={screenGeneration} isPageVisible={isPageVisible} />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm">Screen paused</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
