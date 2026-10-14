import { create } from 'zustand'
import { WorkOrder, Technician, Customer, DashboardStats, CurrentUser } from '@/types'
import { MOCK_USERS, getDefaultUserByRole } from '@/lib/permissions'
import { 
  generateWorkOrdersByRole, 
  generateTechniciansByRole, 
  generateCustomersByRole,
  generateDashboardStatsByRole 
} from './roleBasedData'

interface AppState {
  workOrders: WorkOrder[]
  technicians: Technician[]
  customers: Customer[]
  dashboardStats: DashboardStats
  currentUser: CurrentUser // Full user object
  
  // Actions
  addWorkOrder: (order: WorkOrder) => void
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void
  deleteWorkOrder: (id: string) => void
  assignTechnician: (orderId: string, technicianId: string) => void
  updateTechnicianLocation: (id: string, lat: number, lng: number) => void
  updateTechnicianStatus: (id: string, status: Technician['status']) => void
  addTechnician: (technician: Technician) => void
  updateTechnician: (id: string, updates: Partial<Technician>) => void
  deleteTechnician: (id: string) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  setCurrentUser: (user: CurrentUser) => void
  switchRole: (role: 'admin' | 'technician') => void
  
  // Filtered data based on permissions
  getVisibleWorkOrders: () => WorkOrder[]
  getVisibleTechnicians: () => Technician[]
}

// Initialize default user data
const defaultUser = MOCK_USERS[0]
const initialWorkOrders = generateWorkOrdersByRole(defaultUser.role, defaultUser.technicianId)
const initialTechnicians = generateTechniciansByRole(defaultUser.role, defaultUser.technicianId)
const initialCustomers = generateCustomersByRole(defaultUser.role)
const initialStats = generateDashboardStatsByRole(defaultUser.role, initialWorkOrders)

export const useStore = create<AppState>((set, get) => ({
  workOrders: initialWorkOrders,
  technicians: initialTechnicians,
  customers: initialCustomers,
  currentUser: defaultUser,
  dashboardStats: initialStats,

  addWorkOrder: (order) =>
    set((state) => ({
      workOrders: [...state.workOrders, order],
    })),

  updateWorkOrder: (id, updates) =>
    set((state) => ({
      workOrders: state.workOrders.map((order) =>
        order.id === id ? { ...order, ...updates } : order
      ),
    })),

  deleteWorkOrder: (id) =>
    set((state) => ({
      workOrders: state.workOrders.filter((order) => order.id !== id),
    })),

  assignTechnician: (orderId, technicianId) =>
    set((state) => {
      // TODO: Add validation - check if technician is available
      // TODO: Send push notification to technician (when backend ready)
      // FIXME: Currently allows assigning to offline technicians
      
      const technician = state.technicians.find((t) => t.id === technicianId)
      
      // NOTE: In production, this should be an API call with optimistic update
      // For now, using local state for demo purposes
      
      return {
        workOrders: state.workOrders.map((order) =>
          order.id === orderId
            ? { ...order, technician, status: 'assigned' }
            : order
        ),
      }
    }),

  updateTechnicianLocation: (id, lat, lng) =>
    set((state) => ({
      technicians: state.technicians.map((tech) =>
        tech.id === id
          ? {
              ...tech,
              currentLocation: { ...tech.currentLocation, lat, lng },
            }
          : tech
      ),
    })),

  updateTechnicianStatus: (id, status) =>
    set((state) => ({
      technicians: state.technicians.map((tech) =>
        tech.id === id ? { ...tech, status } : tech
      ),
    })),

  addTechnician: (technician) =>
    set((state) => ({
      technicians: [...state.technicians, technician],
    })),

  updateTechnician: (id, updates) =>
    set((state) => ({
      technicians: state.technicians.map((tech) =>
        tech.id === id ? { ...tech, ...updates } : tech
      ),
    })),

  deleteTechnician: (id) =>
    set((state) => ({
      technicians: state.technicians.filter((tech) => tech.id !== id),
    })),

  addCustomer: (customer) =>
    set((state) => ({
      customers: [...state.customers, customer],
    })),

  updateCustomer: (id, updates) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === id ? { ...customer, ...updates } : customer
      ),
    })),

  deleteCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter((customer) => customer.id !== id),
    })),

  setCurrentUser: (user) => {
    // Regenerate data for the new user role
    const newWorkOrders = generateWorkOrdersByRole(user.role, user.technicianId)
    const newTechnicians = generateTechniciansByRole(user.role, user.technicianId)
    const newCustomers = generateCustomersByRole(user.role)
    const newStats = generateDashboardStatsByRole(user.role, newWorkOrders)
    
    set({ 
      currentUser: user,
      workOrders: newWorkOrders,
      technicians: newTechnicians,
      customers: newCustomers,
      dashboardStats: newStats,
    })
  },
  
  // Quick role switching (for demo)
  switchRole: (role) => {
    const user = getDefaultUserByRole(role)
    get().setCurrentUser(user)
  },

  // Filter work orders based on permissions
  getVisibleWorkOrders: () => {
    const state = get()
    const { currentUser, workOrders } = state
    
    // Admin can see all work orders
    if (currentUser.permissions.canViewAllOrders) {
      return workOrders
    }
    
    // Technician can only see assigned work orders
    if (currentUser.technicianId) {
      return workOrders.filter(
        order => order.technician?.id === currentUser.technicianId
      )
    }
    
    return []
  },

  // Filter technician list based on permissions
  getVisibleTechnicians: () => {
    const state = get()
    const { currentUser, technicians } = state
    
    // Admin can see all technicians
    if (currentUser.permissions.canManageTechnicians) {
      return technicians
    }
    
    // Technician can only see themselves
    if (currentUser.technicianId) {
      return technicians.filter(
        tech => tech.id === currentUser.technicianId
      )
    }
    
    return []
  },
}))
