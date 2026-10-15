import { useState } from 'react'
import { Bell, X, Check, CheckCheck, Trash2, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react'
import { useNotificationStore } from '@/store/useNotificationStore'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export default function NotificationCenter() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      setIsOpen(false)
    }
  }

  const getIcon = (type: typeof notifications[0]['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-slideDown max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={cn(
                    'flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={cn(
                    'flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    filter === 'unread'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Action Buttons */}
              {notifications.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'p-4 transition-colors cursor-pointer group',
                        !notification.read && 'bg-blue-50 dark:bg-blue-900/10',
                        'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              'text-sm font-medium',
                              !notification.read 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-600 dark:text-gray-300'
                            )}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </span>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification.id)
                                  }}
                                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                  title="Mark as read"
                                >
                                  <Check className="h-3.5 w-3.5 text-gray-500" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                title="Delete"
                              >
                                <X className="h-3.5 w-3.5 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
