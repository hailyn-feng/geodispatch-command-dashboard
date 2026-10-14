import { useStore } from '@/store/useStore'
import { TrendingUp, CheckCircle, Users, Zap, Target, Award, Gauge, MapPin, Clock, AlertCircle, Activity, Flame } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { cn } from '@/lib/utils'

const revenueData = [
  { name: 'Mon', revenue: 4200, orders: 12 },
  { name: 'Tue', revenue: 5800, orders: 15 },
  { name: 'Wed', revenue: 6200, orders: 18 },
  { name: 'Thu', revenue: 5400, orders: 14 },
  { name: 'Fri', revenue: 7100, orders: 20 },
  { name: 'Sat', revenue: 8900, orders: 22 },
  { name: 'Sun', revenue: 6800, orders: 16 },
]

const NEON_COLORS = {
  cyan: '#06b6d4',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  green: '#10b981',
  orange: '#f59e0b',
}

export default function DisplayDashboard() {
  const { dashboardStats, workOrders, technicians } = useStore()

  const urgentOrders = workOrders.filter(o => o.priority === 'urgent' && o.status !== 'completed')
  const topTechs = [...technicians].sort((a, b) => b.completedToday - a.completedToday).slice(0, 5)

  const statusCounts = {
    completed: workOrders.filter(o => o.status === 'completed').length,
    inProgress: workOrders.filter(o => o.status === 'in-progress').length,
    assigned: workOrders.filter(o => o.status === 'assigned').length,
    pending: workOrders.filter(o => o.status === 'pending').length,
  }

  const techStatusCounts = {
    available: technicians.filter(t => t.status === 'available').length,
    busy: technicians.filter(t => t.status === 'busy').length,
    break: technicians.filter(t => t.status === 'on-break').length,
    offline: technicians.filter(t => t.status === 'offline').length,
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.5); }
          50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.8); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
        .glass-panel {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(6, 182, 212, 0.2);
          box-shadow: 0 0 40px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="p-6 space-y-6">
        {/* Top Row - KPI Overview (3 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Primary Stats with Big Numbers */}
          <div className="glass-panel rounded-2xl p-6 border-cyan-500/30 animate-slide-up">
            <h3 className="text-xs font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <Activity className="h-4 w-4 animate-pulse" />
              PRIMARY METRICS
            </h3>
            <div className="space-y-6">
              <div>
                <div className="text-[10px] text-gray-400 mb-1">Total Orders</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white font-mono">{dashboardStats.totalOrders}</span>
                  <span className="text-sm text-green-400 font-semibold">+12%</span>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <div className="text-[10px] text-gray-400 mb-1">Completed Today</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-green-400 font-mono">{dashboardStats.completedToday}</span>
                  <span className="text-sm text-green-400 font-semibold">+8%</span>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <div className="text-[10px] text-gray-400 mb-1">Active Technicians</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-blue-400 font-mono">{dashboardStats.activeTechnicians}</span>
                  <span className="text-sm text-blue-400">online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Line Chart - Revenue Trend */}
          <div className="glass-panel rounded-2xl p-6 border-cyan-500/30 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              REVENUE TREND
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.2)" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={NEON_COLORS.cyan} 
                  strokeWidth={3}
                  dot={{ fill: NEON_COLORS.cyan, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Column 3: Progress Bars - Order Status */}
          <div className="glass-panel rounded-2xl p-6 border-cyan-500/30 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xs font-bold text-white mb-6 flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400" />
              ORDER STATUS
            </h3>
            <div className="space-y-5">
              <ProgressBar label="Completed" value={statusCounts.completed} max={dashboardStats.totalOrders} color="from-green-500 to-emerald-500" />
              <ProgressBar label="In Progress" value={statusCounts.inProgress} max={dashboardStats.totalOrders} color="from-blue-500 to-cyan-500" />
              <ProgressBar label="Assigned" value={statusCounts.assigned} max={dashboardStats.totalOrders} color="from-orange-500 to-yellow-500" />
              <ProgressBar label="Pending" value={statusCounts.pending} max={dashboardStats.totalOrders} color="from-pink-500 to-rose-500" />
            </div>
          </div>
        </div>

        {/* Middle Row - Charts (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Weekly Orders */}
          <div className="glass-panel rounded-2xl p-6 border-cyan-500/30 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
              <BarChart className="h-4 w-4 text-cyan-400" />
              WEEKLY PERFORMANCE
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.2)" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="orders" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NEON_COLORS.cyan} stopOpacity={1} />
                    <stop offset="100%" stopColor={NEON_COLORS.blue} stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart - Technician Activity */}
          <div className="glass-panel rounded-2xl p-6 border-cyan-500/30 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              TECH EFFICIENCY
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.2)" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NEON_COLORS.purple} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={NEON_COLORS.purple} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="orders" stroke={NEON_COLORS.purple} strokeWidth={2} fill="url(#areaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row - Lists (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent Orders List */}
          <div className="glass-panel rounded-2xl p-6 border-red-500/30 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-xs font-bold text-red-400 mb-4 flex items-center gap-2">
              <Flame className="h-4 w-4 animate-pulse" />
              URGENT ORDERS ({urgentOrders.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
              {urgentOrders.slice(0, 8).map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border-l-4 border-red-500 hover:bg-red-500/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{order.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-red-400" />
                      <span className="text-[10px] text-gray-400">{order.customer.name}</span>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <span className={cn(
                      "text-[10px] px-2 py-1 rounded-full font-semibold",
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      order.status === 'assigned' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    )}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Technicians Leaderboard */}
          <div className="glass-panel rounded-2xl p-6 border-green-500/30 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-xs font-bold text-green-400 mb-4 flex items-center gap-2">
              <Award className="h-4 w-4" />
              TOP PERFORMERS
            </h3>
            <div className="space-y-3">
              {topTechs.map((tech, index) => (
                <div
                  key={tech.id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg border-l-4 border-green-500 hover:from-green-500/20 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <img
                    src={tech.avatar}
                    alt={tech.name}
                    className="w-10 h-10 rounded-full border-2 border-green-500 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{tech.name}</p>
                    <p className="text-[10px] text-gray-400">{tech.skills[0]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400 font-mono">{tech.completedToday}</p>
                    <p className="text-[8px] text-gray-500">completed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Status Grid - Tech Status Breakdown */}
        <div className="glass-panel rounded-2xl p-6 border-cyan-500/30 animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-cyan-400" />
            TECHNICIAN STATUS DISTRIBUTION
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatusCard label="Available" value={techStatusCounts.available} color="from-green-500 to-emerald-500" icon={CheckCircle} />
            <StatusCard label="Busy" value={techStatusCounts.busy} color="from-blue-500 to-cyan-500" icon={Zap} />
            <StatusCard label="On Break" value={techStatusCounts.break} color="from-orange-500 to-yellow-500" icon={Clock} />
            <StatusCard label="Offline" value={techStatusCounts.offline} color="from-gray-500 to-gray-600" icon={AlertCircle} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Components
function ProgressBar({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0
  
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-2">
        <span className="text-gray-400 font-semibold">{label}</span>
        <span className="text-white font-bold">{value} ({percentage}%)</span>
      </div>
      <div className="h-2.5 bg-gray-800/50 rounded-full overflow-hidden border border-white/5">
        <div 
          className={cn('h-full bg-gradient-to-r transition-all duration-700 ease-out', color)}
          style={{ 
            width: `${percentage}%`,
            boxShadow: '0 0 15px currentColor'
          }}
        />
      </div>
    </div>
  )
}

function StatusCard({ label, value, color, icon: Icon }: { label: string, value: number, color: string, icon: any }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl p-4 bg-gradient-to-br", color, "group hover:scale-105 transition-transform duration-300")}>
      <div className="absolute top-0 right-0 opacity-10">
        <Icon className="h-20 w-20" />
      </div>
      <div className="relative">
        <Icon className="h-6 w-6 text-white mb-2 animate-float" />
        <p className="text-3xl font-bold text-white font-mono">{value}</p>
        <p className="text-[10px] text-white/80 font-semibold uppercase tracking-wide">{label}</p>
      </div>
    </div>
  )
}
