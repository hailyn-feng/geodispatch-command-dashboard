import { Award, Flame, Target, TrendingUp, Wrench } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { cn } from '@/lib/utils'
import type { Technician } from '@/types'
import { memo, useMemo, useState, useEffect } from 'react'

interface TechnicianViewProps {
  technicians: Technician[]
  onTechClick: (techId: string) => void
  selectedTech: string | null
  isPageVisible?: boolean
}

// 静态数据移到组件外部，避免重复创建
const revenueData = [
  { name: 'Mon', revenue: 4200, orders: 12 },
  { name: 'Tue', revenue: 5800, orders: 15 },
  { name: 'Wed', revenue: 6200, orders: 18 },
  { name: 'Thu', revenue: 5400, orders: 14 },
  { name: 'Fri', revenue: 7100, orders: 20 },
  { name: 'Sat', revenue: 8900, orders: 22 },
  { name: 'Sun', revenue: 6800, orders: 16 },
]

const categoryData = [
  { category: 'HVAC', residential: 45, commercial: 38, emergency: 12, color: '#60A5FA' },
  { category: 'Plumbing', residential: 38, commercial: 32, emergency: 18, color: '#34D399' },
  { category: 'Electrical', residential: 32, commercial: 28, emergency: 15, color: '#A78BFA' },
  { category: 'Appliance', residential: 28, commercial: 22, emergency: 10, color: '#FBBF24' },
  { category: 'Security', residential: 22, commercial: 18, emergency: 8, color: '#FB7185' },
  { category: 'Carpentry', residential: 18, commercial: 15, emergency: 5, color: '#60A5FA' },
  { category: 'Painting', residential: 15, commercial: 12, emergency: 3, color: '#34D399' },
  { category: 'Cleaning', residential: 12, commercial: 10, emergency: 2, color: '#A78BFA' },
]

// 优化：使用memo包裹整个组件
export const TechnicianView = memo(function TechnicianView({ technicians, onTechClick, selectedTech, isPageVisible = true }: TechnicianViewProps) {
  // 使用useMemo缓存计算结果
  const activeTechs = useMemo(() => 
    technicians.filter(t => t.status !== 'offline'),
    [technicians]
  )

  // 折线图动画状态 - 控制显示的数据点数量
  const [visibleDataPoints, setVisibleDataPoints] = useState(0)
  const totalDataPoints = revenueData.length

  useEffect(() => {
    if (!isPageVisible) return
    
    // 初始化：立即开始动画
    setVisibleDataPoints(0)
    
    // 逐点出现动画
    const pointInterval = setInterval(() => {
      setVisibleDataPoints(prev => {
        if (prev < totalDataPoints) {
          return prev + 1
        }
        return prev
      })
    }, 500) // 每500ms显示一个点

    // 动画完成后等待，然后重新触发
    const animationDuration = totalDataPoints * 500 // 7个点 * 500ms = 3500ms
    const resetInterval = setInterval(() => {
      setVisibleDataPoints(0)
    }, animationDuration + 2000) // 动画完成后等待2秒再重置

    return () => {
      clearInterval(pointInterval)
      clearInterval(resetInterval)
    }
  }, [isPageVisible, totalDataPoints])

  // 创建固定X轴的占位数据 - 始终显示所有7个点位置
  const chartData = useMemo(() => {
    return revenueData.map((item, index) => {
      if (index < visibleDataPoints) {
        // 已显示的点，显示真实数据
        return item
      } else {
        // 未显示的点，返回空数据但保留name以固定X轴
        return { name: item.name, revenue: null, orders: null }
      }
    })
  }, [visibleDataPoints])

  return (
    <div className="space-y-4">
      {/* 团队绩效KPI - 横向布局，文字和进度条在同一行 */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Team Performance</h3>
        <div className="space-y-2">
          {/* Avg Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 min-w-[120px]">
              <Award className="h-3.5 w-3.5 text-yellow-400" />
              <span className="text-gray-300 font-semibold text-[11px]">Avg Rating</span>
              <span className="text-yellow-400 font-bold font-mono text-sm">4.8</span>
            </div>
            <div className="flex-1 h-2 bg-gray-800/50 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: '96%',
                  background: 'linear-gradient(to right, rgba(251, 191, 36, 0.8), rgba(245, 158, 11, 0.8))'
                }}
              />
            </div>
          </div>

          {/* Efficiency */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 min-w-[120px]">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-gray-300 font-semibold text-[11px]">Efficiency</span>
              <span className="text-orange-400 font-bold font-mono text-sm">80%</span>
            </div>
            <div className="flex-1 h-2 bg-gray-800/50 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: '80%',
                  background: 'linear-gradient(to right, rgba(251, 146, 60, 0.8), rgba(249, 115, 22, 0.8))'
                }}
              />
            </div>
          </div>

          {/* On-Time Rate */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 min-w-[120px]">
              <Target className="h-3.5 w-3.5 text-green-400" />
              <span className="text-gray-300 font-semibold text-[11px]">On-Time</span>
              <span className="text-green-400 font-bold font-mono text-sm">60%</span>
            </div>
            <div className="flex-1 h-2 bg-gray-800/50 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: '60%',
                  background: 'linear-gradient(to right, rgba(74, 222, 128, 0.8), rgba(34, 197, 94, 0.8))'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 技术员列表 */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
          Active Technicians ({activeTechs.length})
        </h3>
        <div className="space-y-2 max-h-[252px] overflow-y-auto overflow-x-hidden custom-scrollbar px-0.5">
          {activeTechs.map(tech => (
            <TechCard
              key={tech.id}
              tech={tech}
              isSelected={selectedTech === tech.id}
              onClick={() => onTechClick(tech.id)}
            />
          ))}
        </div>
      </div>

      {/* 周趋势图 - 移到最下方，添加动画 */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          Weekly Revenue Trend
        </h3>
        <div className="bg-gray-900/50 rounded-lg p-2 border border-gray-800">
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: -15 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#94A3B8', fontSize: 10 }} 
                stroke="#4b5563"
              />
              <YAxis 
                tick={{ fill: '#94A3B8', fontSize: 10 }} 
                stroke="#4b5563"
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.98)', 
                  border: '1px solid rgba(55, 65, 81, 0.8)',
                  borderRadius: '0.5rem',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#fff',
                  padding: '8px 12px',
                  backdropFilter: 'blur(12px)',
                }}
                itemStyle={{
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
                labelStyle={{
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                fill="url(#colorRevenue)"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 服务类型分布柱状图 */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
          <Wrench className="h-3.5 w-3.5" />
          Service Category Distribution
        </h3>
        {/* 图例 */}
        <div className="flex items-center justify-center gap-3 text-[9px] pb-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-[#38BDF8]"></div>
            <span className="text-gray-400">Residential</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-[#A78BFA]"></div>
            <span className="text-gray-400">Commercial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-[#FB7185]"></div>
            <span className="text-gray-400">Emergency</span>
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2 border border-gray-800">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={categoryData} margin={{ top: 5, right: -20, left: -45, bottom: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="category" 
                tick={{ fill: '#94A3B8', fontSize: 8 }} 
                stroke="#4b5563"
                angle={-15}
                textAnchor="end"
                height={35}
              />
              <YAxis 
                tick={{ fill: '#94A3B8', fontSize: 10 }} 
                stroke="#4b5563"
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.98)', 
                  border: '1px solid rgba(55, 65, 81, 0.8)',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#fff',
                  padding: '8px 12px',
                  backdropFilter: 'blur(12px)',
                }}
                itemStyle={{
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
                labelStyle={{
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              />
              <Bar dataKey="residential" name="Residential" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="commercial" name="Commercial" fill="#A78BFA" radius={[4, 4, 0, 0]} />
              <Bar dataKey="emergency" name="Emergency" fill="#FB7185" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
})

// 优化：使用memo包裹TechCard子组件
const TechCard = memo(function TechCard({ 
  tech, 
  isSelected, 
  onClick 
}: { 
  tech: Technician
  isSelected: boolean
  onClick: () => void
}) {
  const statusColors = {
    available: 'bg-green-500',
    busy: 'bg-cyan-500',
    'on-break': 'bg-orange-500',
    offline: 'bg-gray-500',
  }

  const statusLabels = {
    available: 'Available',
    busy: 'Busy',
    'on-break': 'On Break',
    offline: 'Offline',
  }

  return (
    <button
      onClick={onClick}
      style={isSelected ? { backgroundColor: '#13272C', borderColor: 'rgba(34, 107, 116, 0.34)' } : { backgroundColor: '#111827', borderColor: '#273444' }}
      className={cn(
        "w-full p-2.5 rounded-lg border transition-all text-left group",
        isSelected && "shadow-sm"
      )}
    >
      <div className="flex items-center gap-2.5">
        {/* 头像 - 缩小 */}
        <div className="relative flex-shrink-0">
          <img
            src={tech.avatar}
            alt={tech.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700 group-hover:ring-cyan-500/50 transition-all"
          />
          {/* 状态指示器 */}
          <div className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900",
            statusColors[tech.status as keyof typeof statusColors] || 'bg-gray-500'
          )} />
        </div>

        {/* 信息区 - 缩小字体 */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#F8FAFC] truncate transition-colors">
            {tech.name}
          </p>
          <p className="text-[10px] text-[#CBD5E1] mt-0.5">
            {statusLabels[tech.status as keyof typeof statusLabels] || tech.status}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-[8px] text-[#94A3B8]">
            <span className="truncate">📍 {tech.currentLocation ? `${tech.currentLocation.lat.toFixed(2)}, ${tech.currentLocation.lng.toFixed(2)}` : 'N/A'}</span>
            <span>•</span>
            <span className="flex-shrink-0 text-[#FBBF24]">⭐ {tech.rating}</span>
          </div>
        </div>

        {/* 点击提示 - 缩小 */}
        <div className="flex-shrink-0 text-[#64748B] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
})
