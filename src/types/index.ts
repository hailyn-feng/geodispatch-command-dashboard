export type WorkOrderStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TechnicianStatus = 'available' | 'busy' | 'offline' | 'on-break'
export type UserRole = 'admin' | 'technician'

// 权限配置
export interface UserPermissions {
  canViewAllOrders: boolean
  canEditOrders: boolean
  canDeleteOrders: boolean
  canAssignTechnicians: boolean
  canViewDashboard: boolean
  canViewMap: boolean
  canViewDisplayScreen: boolean
  canManageCustomers: boolean
  canManageTechnicians: boolean
}

export interface Location {
  lat: number
  lng: number
  address: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  location: Location
  totalOrders: number
  rating: number
}

export interface Technician {
  id: string
  name: string
  email: string
  phone: string
  status: TechnicianStatus
  skills: string[]
  avatar: string
  currentLocation: Location
  assignedOrders: number
  completedToday: number
  rating: number
  vehiclePlate?: string // 车牌号
}

// 当前登录用户信息
export interface CurrentUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string // 用户头像
  technicianId?: string // 如果是技术员角色，关联技术员ID
  permissions: UserPermissions
}

export interface WorkOrder {
  id: string
  title: string
  description: string
  status: WorkOrderStatus
  priority: WorkOrderPriority
  customer: Customer
  technician?: Technician
  scheduledDate: string
  completedDate?: string
  estimatedDuration: number
  actualDuration?: number
  location: Location
  category: string
  notes: string[]
  attachments: string[]
  signature?: string
  rating?: number
}

export interface DashboardStats {
  totalOrders: number
  completedToday: number
  inProgress: number
  avgResponseTime: number
  customerSatisfaction: number
  revenue: number
  activeTechnicians: number
}
