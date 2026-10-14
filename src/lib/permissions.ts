import { UserRole, UserPermissions, CurrentUser } from '@/types'

/**
 * 权限配置管理
 * 根据业务需求文档实现：
 * 1. Admin (调度管理员)
 *    - ✅ 可访问 /big-screen 全局大屏
 *    - ✅ 可查看所有车辆、人员轨迹、全部工单
 *    - ✅ 新建工单、拖拽地图派单、修改工单状态
 * 
 * 2. Technician (外勤技术员)
 *    - ❌ 大屏入口完全隐藏，无法访问 /big-screen
 *    - ✅ 仅 Mobile View 移动端视图，只能查看自己的车辆实时位置、自己的历史轨迹
 *    - ✅ 只能查看分配给自己的工单，不能派单、不能编辑其他工单
 */

// 角色权限配置
export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canViewAllOrders: true,
    canEditOrders: true,
    canDeleteOrders: true,
    canAssignTechnicians: true,
    canViewDashboard: true,
    canViewMap: true,
    canViewDisplayScreen: true, // ✅ Admin 可以访问大屏
    canManageCustomers: true,
    canManageTechnicians: true,
  },
  technician: {
    canViewAllOrders: false, // ❌ 只能看自己的
    canEditOrders: false, // ❌ 不能编辑
    canDeleteOrders: false,
    canAssignTechnicians: false, // ❌ 不能派单
    canViewDashboard: false, // ❌ 不能访问主Dashboard
    canViewMap: false, // ❌ 不能访问地图调度
    canViewDisplayScreen: false, // ❌ 完全隐藏大屏入口
    canManageCustomers: false,
    canManageTechnicians: false,
  },
}

/**
 * 获取角色权限
 */
export function getPermissionsByRole(role: UserRole): UserPermissions {
  return ROLE_PERMISSIONS[role]
}

/**
 * 检查用户是否有特定权限
 */
export function hasPermission(
  user: CurrentUser | null,
  permission: keyof UserPermissions
): boolean {
  if (!user) return false
  return user.permissions[permission]
}

/**
 * Mock user data for demo purposes
 * In production, this data should come from backend API
 */
export const MOCK_USERS: CurrentUser[] = [
  {
    id: 'user-admin-1',
    name: 'Admin Manager',
    email: 'admin@company.com',
    role: 'admin',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    permissions: ROLE_PERMISSIONS.admin,
  },
  {
    id: 'user-tech-1',
    name: 'David Martinez',
    email: 'david.m@company.com',
    role: 'technician',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    technicianId: 't1',
    permissions: ROLE_PERMISSIONS.technician,
  },
  {
    id: 'user-tech-2',
    name: 'James Anderson',
    email: 'james.a@company.com',
    role: 'technician',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    technicianId: 't2',
    permissions: ROLE_PERMISSIONS.technician,
  },
]

/**
 * Get user by technician ID
 */
export function getUserByTechnicianId(technicianId: string): CurrentUser | undefined {
  return MOCK_USERS.find(user => user.technicianId === technicianId)
}

/**
 * Get default user by role (for role switching)
 */
export function getDefaultUserByRole(role: UserRole): CurrentUser {
  const user = MOCK_USERS.find(u => u.role === role)
  return user || MOCK_USERS[0]
}
