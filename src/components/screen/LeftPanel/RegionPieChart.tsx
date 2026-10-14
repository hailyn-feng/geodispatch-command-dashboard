import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { memo } from 'react'

// 静态数据移到组件外部
const regionData = [
  { name: 'Manhattan', value: 320, color: '#60A5FA' }, // 紫色改为橙色
  { name: 'Brooklyn', value: 280, color: '#34D399' },
  { name: 'Queens', value: 220, color: '#A78BFA' },
  { name: 'Bronx', value: 120, color: '#FBBF24' },
  { name: 'Staten Island', value: 60, color: '#FB7185' },
]

// 优化：使用memo避免不必要的重渲染
export const RegionPieChart = memo(function RegionPieChart() {
  return (
    <div className="bg-gray-900/40 backdrop-blur-md rounded-lg p-2 border border-gray-800/50">
      <ResponsiveContainer width="100%" height={110}>
        <PieChart>
          <Pie
            data={regionData}
            cx="50%"
            cy="50%"
            innerRadius={28}
            outerRadius={45}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
            activeShape={false}
            isAnimationActive={false}
          >
            {regionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.98)',
              border: '1px solid rgba(55, 65, 81, 0.8)',
              borderRadius: '0.5rem',
              fontSize: '11px',
              fontWeight: '600',
              color: '#fff',
              padding: '6px 10px',
              backdropFilter: 'blur(12px)',
            }}
            itemStyle={{
              color: '#fff',
              fontSize: '11px',
              fontWeight: '600',
            }}
            formatter={(value: number, name: string) => [`${value} orders`, name]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            layout="vertical"
            iconType="circle"
            iconSize={5}
            wrapperStyle={{
              fontSize: '8px',
              paddingLeft: '6px',
              lineHeight: '1.5',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
})
