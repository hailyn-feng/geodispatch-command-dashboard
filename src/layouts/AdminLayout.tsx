import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  MapPin, 
  ClipboardList, 
  Users, 
  UserCheck, 
  Map,
  Menu,
  X,
  Moon,
  Sun,
  Monitor,
  Calendar
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { hasPermission, MOCK_USERS } from '@/lib/permissions'
import CustomSelect from '@/components/CustomSelect'

// Navigation configuration - each menu item has permission requirements
const navigation = [
  { 
    name: 'Schedule Calendar', 
    href: '/admin/schedule', 
    icon: Calendar,
    requiredPermission: 'canAssignTechnicians' as const
  },
  { 
    name: 'Map Dispatch', 
    href: '/admin/map-dispatch', 
    icon: Map, 
    requiredPermission: 'canViewMap' as const
  },
  { 
    name: 'Dispatch Board', 
    href: '/admin/dispatch', 
    icon: ClipboardList,
    requiredPermission: 'canAssignTechnicians' as const
  },
  { 
    name: 'Work Orders', 
    href: '/admin/work-orders', 
    icon: ClipboardList,
    requiredPermission: 'canViewAllOrders' as const
  },
  { 
    name: 'Technicians', 
    href: '/admin/technicians', 
    icon: UserCheck,
    requiredPermission: 'canManageTechnicians' as const
  },
  { 
    name: 'Customers', 
    href: '/admin/customers', 
    icon: Users,
    requiredPermission: 'canManageCustomers' as const
  },
  { 
    name: 'Mobile View', 
    href: '/admin/mobile', 
    icon: MapPin,
    // Mobile View accessible to all (but shows different content)
    requiredPermission: null
  },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const { currentUser, setCurrentUser } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isScreenMode = location.pathname.startsWith('/screen')

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Handle user switching
  const handleUserSwitch = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId)
    if (user) {
      setCurrentUser(user)
      // 根据用户角色跳转到对应页面
      if (user.role === 'technician') {
        // technician 用户跳转到 mobile 页面
        navigate('/admin/mobile')
      } else {
        // admin 用户跳转到主页（schedule）
        navigate('/admin/schedule')
      }
    }
  }

  // Filter navigation menu based on permissions
  const visibleNavigation = navigation.filter(item => {
    if (!item.requiredPermission) return true
    return hasPermission(currentUser, item.requiredPermission)
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-10 items-center justify-between px-6 border-b dark:border-gray-700">
          <h1 className="text-lg font-bold" style={{ color: '#3686f4' }}>
            FieldService Pro
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-3 px-3">
          {visibleNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-cyan-50 dark:bg-cyan-900/50'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )
              }
              style={({ isActive }) => isActive ? { color: '#3686f4' } : undefined}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src={`https://i.pravatar.cc/150?u=${currentUser.id}`}
              alt={currentUser.name}
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-10 items-center gap-4 border-b bg-white px-6 dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          {/* Hint text + Capsule toggle - Cyan gradient style - Small version - Theme adapted */}
          <div className="flex items-center gap-2">
            {/* Hint text */}
            <span className="text-gray-400 dark:text-gray-500 text-[10px] whitespace-nowrap">
              {isScreenMode ? 'Switch to Admin' : 'Switch to Screen'}
            </span>
            
            <div className="flex items-center gap-0 bg-gray-100 dark:bg-gray-900/80 backdrop-blur-md rounded-md overflow-hidden border border-cyan-500/30">
              {/* 大屏选项 */}
              <button
                onClick={() => navigate('/screen')}
                className={`
                  relative flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-all duration-300
                  ${isScreenMode 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg cursor-default' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-white hover:bg-cyan-50 dark:hover:bg-gray-800/50 cursor-pointer'
                  }
                `}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span className="text-xs">Screen</span>
              </button>
              
              {/* 分隔线 */}
              {isScreenMode && <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>}
              
              {/* 管理面板选项 */}
              <button
                onClick={() => navigate('/admin/schedule')}
                className={`
                  relative flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-all duration-300
                  ${!isScreenMode 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg cursor-default' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-white hover:bg-cyan-50 dark:hover:bg-gray-800/50 cursor-pointer'
                  }
                `}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="text-xs">Admin</span>
              </button>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* User Switcher */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Switch User:</span>
            <CustomSelect
              value={currentUser.id}
              onChange={(value) => handleUserSwitch(value)}
              options={MOCK_USERS.map(user => ({
                value: user.id,
                label: `${user.role === 'admin' ? '👨‍💼' : '🔧'} ${user.name}`
              }))}
              className="w-48"
            />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
