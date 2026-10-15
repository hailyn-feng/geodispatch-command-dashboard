import { useStore } from '@/store/useStore'
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  Star,
  AlertCircle 
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

const revenueData = [
  { name: 'Mon', revenue: 4200 },
  { name: 'Tue', revenue: 5800 },
  { name: 'Wed', revenue: 6200 },
  { name: 'Thu', revenue: 5400 },
  { name: 'Fri', revenue: 7100 },
  { name: 'Sat', revenue: 8900 },
  { name: 'Sun', revenue: 6800 },
]

const ordersData = [
  { name: 'Mon', completed: 12, pending: 5 },
  { name: 'Tue', completed: 15, pending: 8 },
  { name: 'Wed', completed: 18, pending: 6 },
  { name: 'Thu', completed: 14, pending: 7 },
  { name: 'Fri', completed: 20, pending: 4 },
  { name: 'Sat', completed: 22, pending: 9 },
  { name: 'Sun', completed: 16, pending: 5 },
]

const statusDistribution = [
  { name: 'Completed', value: 145, color: '#10B981' },
  { name: 'In Progress', value: 68, color: '#3B82F6' },
  { name: 'Pending', value: 42, color: '#F59E0B' },
  { name: 'Cancelled', value: 15, color: '#6B7280' },
]

const categoryData = [
  { name: 'Plumbing', value: 85, color: '#8B5CF6' },
  { name: 'Electrical', value: 72, color: '#EC4899' },
  { name: 'HVAC', value: 58, color: '#F59E0B' },
  { name: 'Maintenance', value: 45, color: '#10B981' },
  { name: 'Other', value: 10, color: '#6B7280' },
]

const performanceData = [
  { time: '00:00', orders: 12 },
  { time: '04:00', orders: 8 },
  { time: '08:00', orders: 35 },
  { time: '12:00', orders: 52 },
  { time: '16:00', orders: 48 },
  { time: '20:00', orders: 28 },
  { time: '23:59', orders: 15 },
]

export default function Dashboard() {
  const { dashboardStats, workOrders, technicians } = useStore()

  const urgentOrders = workOrders.filter(o => o.priority === 'urgent' && o.status !== 'completed')
  const activeTechs = technicians.filter(t => t.status === 'busy' || t.status === 'available')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          Overview of your field service operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Orders"
          value={dashboardStats.totalOrders}
          icon={<TrendingUp className="h-4 w-4" />}
          trend="+12%"
          trendUp={true}
          color="blue"
        />
        <StatCard
          title="Completed Today"
          value={dashboardStats.completedToday}
          icon={<CheckCircle className="h-4 w-4" />}
          trend="+8%"
          trendUp={true}
          color="green"
        />
        <StatCard
          title="In Progress"
          value={dashboardStats.inProgress}
          icon={<Clock className="h-4 w-4" />}
          color="yellow"
        />
        <StatCard
          title="Avg Response Time"
          value={`${dashboardStats.avgResponseTime}m`}
          icon={<Clock className="h-4 w-4" />}
          trend="-5m"
          trendUp={true}
          color="purple"
        />
        <StatCard
          title="Customer Rating"
          value={dashboardStats.customerSatisfaction.toFixed(1)}
          icon={<Star className="h-4 w-4" />}
          suffix="/5"
          color="amber"
        />
        <StatCard
          title="Revenue (Week)"
          value={`$${(dashboardStats.revenue / 1000).toFixed(1)}k`}
          icon={<DollarSign className="h-4 w-4" />}
          trend="+18%"
          trendUp={true}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Weekly Revenue
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Orders This Week
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New Charts Row - Pie Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Order Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Service Categories
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Area Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Daily Order Volume
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="orders" 
              stroke="#3B82F6" 
              fillOpacity={1} 
              fill="url(#colorOrders)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Urgent Orders & Technician Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Urgent Orders
            </h3>
            <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              {urgentOrders.length} pending
            </span>
          </div>
          <div className="space-y-2">
            {urgentOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {order.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {order.customer.name}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Technician Status
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {activeTechs.length} active
            </span>
          </div>
          <div className="space-y-2">
            {technicians.slice(0, 5).map((tech) => (
              <div key={tech.id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <img
                    src={tech.avatar}
                    alt={tech.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {tech.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tech.completedToday} completed today
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  tech.status === 'available' ? 'bg-green-100 text-green-800' :
                  tech.status === 'busy' ? 'bg-blue-100 text-blue-800' :
                  tech.status === 'on-break' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {tech.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp, 
  color = 'blue',
  suffix = ''
}: { 
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
  color?: string
  suffix?: string
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {value}{suffix}
          </p>
          {trend && (
            <p className={`text-xs mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trend} from last week
            </p>
          )}
        </div>
        <div className={`${colors[color as keyof typeof colors]} p-2.5 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
