import { create } from 'zustand'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 'order' | 'technician' | 'system' | 'alert'

export interface Notification {
  id: string
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  timestamp: number
  read: boolean
  actionUrl?: string
  relatedId?: string // work order id or technician id
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: 'notif-1',
      type: 'warning',
      category: 'order',
      title: 'Urgent Order Assigned',
      message: 'Emergency plumbing repair at 123 Main St requires immediate attention',
      timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
      read: false,
      actionUrl: '/admin/work-orders',
      relatedId: 'WO-001',
    },
    {
      id: 'notif-2',
      type: 'success',
      category: 'order',
      title: 'Order Completed',
      message: 'John Smith completed HVAC maintenance at 456 Oak Ave',
      timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
      read: false,
      actionUrl: '/admin/work-orders',
      relatedId: 'WO-002',
    },
    {
      id: 'notif-3',
      type: 'info',
      category: 'technician',
      title: 'Technician Available',
      message: 'Sarah Johnson is now available for new assignments',
      timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      read: true,
      actionUrl: '/admin/technicians',
      relatedId: 'tech-001',
    },
    {
      id: 'notif-4',
      type: 'error',
      category: 'alert',
      title: 'Delayed Order',
      message: 'Electrical repair order is 30 minutes behind schedule',
      timestamp: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
      read: false,
      actionUrl: '/admin/work-orders',
      relatedId: 'WO-003',
    },
    {
      id: 'notif-5',
      type: 'info',
      category: 'system',
      title: 'System Update',
      message: 'New features available: Advanced filters and batch operations',
      timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
      read: true,
    },
  ],
  unreadCount: 3,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      read: false,
    }
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
      unreadCount: state.unreadCount + 1,
    }))
  },

  markAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      if (!notification || notification.read) return state

      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  deleteNotification: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      const wasUnread = notification && !notification.read

      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }
    }),

  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}))
