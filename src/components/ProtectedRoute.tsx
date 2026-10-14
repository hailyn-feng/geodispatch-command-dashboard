import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { hasPermission } from '@/lib/permissions'
import { UserPermissions } from '@/types'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission?: keyof UserPermissions
  fallbackPath?: string
}

/**
 * 权限保护路由组件
 * 
 * 用法:
 * <ProtectedRoute requiredPermission="canViewDashboard">
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * 如果用户没有权限，会重定向到 fallbackPath (默认 /admin/mobile)
 */
export function ProtectedRoute({ 
  children, 
  requiredPermission,
  fallbackPath = '/admin/mobile' 
}: ProtectedRouteProps) {
  const { currentUser } = useStore()

  // 如果不需要特定权限，直接渲染
  if (!requiredPermission) {
    return <>{children}</>
  }

  // 检查权限
  if (!hasPermission(currentUser, requiredPermission)) {
    // 无权限，重定向
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}

/**
 * 权限提示组件 - 用于页面内的权限控制
 */
interface PermissionGateProps {
  children: ReactNode
  requiredPermission: keyof UserPermissions
  fallback?: ReactNode
}

export function PermissionGate({ 
  children, 
  requiredPermission, 
  fallback = null 
}: PermissionGateProps) {
  const { currentUser } = useStore()

  if (!hasPermission(currentUser, requiredPermission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
