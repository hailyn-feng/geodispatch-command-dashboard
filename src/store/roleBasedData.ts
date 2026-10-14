import { WorkOrder, Technician, Customer, DashboardStats, UserRole } from '@/types'
import { mockCustomers, mockTechnicians } from './mockData'

/**
 * 基于角色生成差异化数据
 * 不同角色看到的数据数量、优先级、状态分布都不同
 */

// 为不同角色生成工单数据
export function generateWorkOrdersByRole(role: UserRole, technicianId?: string): WorkOrder[] {
  const baseCustomers = mockCustomers.slice(0, 5)
  const baseTechnicians = mockTechnicians.slice(0, 5)
  
  if (role === 'admin') {
    // Admin 看到所有工单：大量、多样化、全状态
    // 分散工单到整个星期（周日到周六）
    const today = new Date()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - today.getDay()) // 本周日
    sunday.setHours(9, 0, 0, 0)
    
    return [
      // 周日 (Sun) - wo1, wo2
      {
        id: 'wo-admin-1',
        title: 'Commercial HVAC System Failure',
        description: 'Office building AC system completely down. 50+ employees affected.',
        status: 'pending',
        priority: 'urgent',
        customer: baseCustomers[0],
        scheduledDate: new Date(sunday.getTime()).toISOString(),
        estimatedDuration: 240,
        location: baseCustomers[0].location,
        category: 'HVAC',
        notes: ['Emergency dispatch required', 'Customer willing to pay rush fee'],
        attachments: [],
      },
      {
        id: 'wo-admin-2',
        title: 'Water Main Break - Parking Lot',
        description: 'Major water leak in parking lot. Flooding risk.',
        status: 'assigned',
        priority: 'urgent',
        customer: baseCustomers[1],
        technician: baseTechnicians[0],
        scheduledDate: new Date(sunday.getTime() + 3 * 60 * 60 * 1000).toISOString(), // 周日下午
        estimatedDuration: 180,
        location: baseCustomers[1].location,
        category: 'Plumbing',
        notes: ['Coordinate with city water dept', 'Need excavation equipment'],
        attachments: [],
      },
      
      // 周一 (Mon) - wo3, wo4
      {
        id: 'wo-admin-3',
        title: 'Electrical Panel Upgrade',
        description: 'Upgrade from 100A to 200A service panel.',
        status: 'in-progress',
        priority: 'high',
        customer: baseCustomers[2],
        technician: baseTechnicians[1],
        scheduledDate: new Date(sunday.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 周一
        estimatedDuration: 300,
        location: baseCustomers[2].location,
        category: 'Electrical',
        notes: ['Power shut-off scheduled', 'Inspector coming at 3 PM'],
        attachments: [],
      },
      {
        id: 'wo-admin-4',
        title: 'Restaurant Kitchen Hood Cleaning',
        description: 'Quarterly deep cleaning of commercial kitchen exhaust system.',
        status: 'in-progress',
        priority: 'medium',
        customer: baseCustomers[3],
        technician: baseTechnicians[2],
        scheduledDate: new Date(sunday.getTime() + 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 周一下午
        estimatedDuration: 180,
        location: baseCustomers[3].location,
        category: 'HVAC',
        notes: ['After hours work - restaurant closed', 'Fire marshal inspection required'],
        attachments: [],
      },
      
      // 周二 (Tue) - wo5, wo6
      {
        id: 'wo-admin-5',
        title: 'Security Camera Installation',
        description: 'Install 8 IP cameras around retail store perimeter.',
        status: 'pending',
        priority: 'medium',
        customer: baseCustomers[4],
        scheduledDate: new Date(sunday.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 周二
        estimatedDuration: 360,
        location: baseCustomers[4].location,
        category: 'Security Systems',
        notes: ['Customer provides cameras', 'Network configuration included'],
        attachments: [],
      },
      {
        id: 'wo-admin-6',
        title: 'Boiler Annual Maintenance',
        description: 'Yearly inspection and tune-up of commercial boiler.',
        status: 'pending',
        priority: 'low',
        customer: baseCustomers[0],
        scheduledDate: new Date(sunday.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 周二上午
        estimatedDuration: 120,
        location: baseCustomers[0].location,
        category: 'HVAC',
        notes: ['Maintenance contract', 'Parts inventory check'],
        attachments: [],
      },
      
      // 周三 (Wed) - wo7
      {
        id: 'wo-admin-7',
        title: 'Fire Alarm System Testing',
        description: 'Monthly fire alarm system inspection and testing.',
        status: 'completed',
        priority: 'high',
        customer: baseCustomers[1],
        technician: baseTechnicians[3],
        scheduledDate: new Date(sunday.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 周三
        completedDate: new Date(sunday.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        actualDuration: 90,
        estimatedDuration: 90,
        location: baseCustomers[1].location,
        category: 'Fire Safety',
        notes: ['All systems passed', 'Certificate issued'],
        attachments: [],
        signature: 'data:image/png;base64,...',
        rating: 5,
      },
      
      // 周四 (Thu) - wo8, wo9
      {
        id: 'wo-admin-8',
        title: 'Plumbing Leak Repair',
        description: 'Fix leaking pipe under kitchen sink.',
        status: 'assigned',
        priority: 'medium',
        customer: baseCustomers[2],
        technician: baseTechnicians[4],
        scheduledDate: new Date(sunday.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 周四
        estimatedDuration: 90,
        location: baseCustomers[2].location,
        category: 'Plumbing',
        notes: ['Tenant reported issue', 'Access code provided'],
        attachments: [],
      },
      {
        id: 'wo-admin-9',
        title: 'Smart Thermostat Installation',
        description: 'Install and configure Nest thermostat in 3 zones.',
        status: 'pending',
        priority: 'low',
        customer: baseCustomers[3],
        scheduledDate: new Date(sunday.getTime() + 4 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(), // 周四下午
        estimatedDuration: 150,
        location: baseCustomers[3].location,
        category: 'HVAC',
        notes: ['Customer provides thermostats', 'WiFi setup included'],
        attachments: [],
      },
      
      // 周五 (Fri) - wo10, wo11
      {
        id: 'wo-admin-10',
        title: 'Garbage Disposal Replacement',
        description: 'Replace old garbage disposal unit.',
        status: 'pending',
        priority: 'medium',
        customer: baseCustomers[4],
        scheduledDate: new Date(sunday.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 周五
        estimatedDuration: 90,
        location: baseCustomers[4].location,
        category: 'Plumbing',
        notes: ['Customer prefers InSinkErator brand'],
        attachments: [],
      },
      {
        id: 'wo-admin-11',
        title: 'AC Filter Replacement Service',
        description: 'Replace filters in 3 AC units.',
        status: 'assigned',
        priority: 'low',
        customer: baseCustomers[0],
        technician: baseTechnicians[3],
        scheduledDate: new Date(sunday.getTime() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 周五下午
        estimatedDuration: 45,
        location: baseCustomers[0].location,
        category: 'HVAC',
        notes: ['Routine maintenance'],
        attachments: [],
      },
      
      // 周六 (Sat) - wo12
      {
        id: 'wo-admin-12',
        title: 'Shower Drain Clog',
        description: 'Bathroom shower draining slowly.',
        status: 'assigned',
        priority: 'medium',
        customer: baseCustomers[1],
        technician: baseTechnicians[4],
        scheduledDate: new Date(sunday.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 周六
        estimatedDuration: 60,
        location: baseCustomers[1].location,
        category: 'Plumbing',
        notes: ['Bring snake tool'],
        attachments: [],
      },
    ]
  } else {
    // Technician 只看到分配给自己的工单：数量少、更聚焦
    const techIndex = baseTechnicians.findIndex(t => t.id === technicianId) || 0
    const assignedTech = baseTechnicians[techIndex]
    
    return [
      // 当前正在处理的工单
      {
        id: `wo-tech-${technicianId}-1`,
        title: 'Residential AC Repair',
        description: 'AC unit making loud noise and not cooling efficiently.',
        status: 'in-progress',
        priority: 'high',
        customer: baseCustomers[techIndex % baseCustomers.length],
        technician: assignedTech,
        scheduledDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        estimatedDuration: 120,
        location: baseCustomers[techIndex % baseCustomers.length].location,
        category: 'HVAC',
        notes: ['Customer home until 4 PM', 'Check compressor'],
        attachments: [],
      },
      // 今天待处理的工单
      {
        id: `wo-tech-${technicianId}-2`,
        title: 'Kitchen Faucet Leak',
        description: 'Faucet dripping continuously, wasting water.',
        status: 'assigned',
        priority: 'medium',
        customer: baseCustomers[(techIndex + 1) % baseCustomers.length],
        technician: assignedTech,
        scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        estimatedDuration: 60,
        location: baseCustomers[(techIndex + 1) % baseCustomers.length].location,
        category: 'Plumbing',
        notes: ['Bring replacement cartridges', 'Customer prefers Moen brand'],
        attachments: [],
      },
      {
        id: `wo-tech-${technicianId}-3`,
        title: 'Light Switch Replacement',
        description: 'Replace 3 old light switches with dimmer switches.',
        status: 'assigned',
        priority: 'low',
        customer: baseCustomers[(techIndex + 2) % baseCustomers.length],
        technician: assignedTech,
        scheduledDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        estimatedDuration: 45,
        location: baseCustomers[(techIndex + 2) % baseCustomers.length].location,
        category: 'Electrical',
        notes: ['Customer provides switches'],
        attachments: [],
      },
      // 今天已完成的工单
      {
        id: `wo-tech-${technicianId}-4`,
        title: 'Thermostat Calibration',
        description: 'Thermostat showing incorrect temperature readings.',
        status: 'completed',
        priority: 'medium',
        customer: baseCustomers[(techIndex + 3) % baseCustomers.length],
        technician: assignedTech,
        scheduledDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        estimatedDuration: 30,
        actualDuration: 25,
        location: baseCustomers[(techIndex + 3) % baseCustomers.length].location,
        category: 'HVAC',
        notes: ['Calibrated successfully'],
        attachments: [],
        rating: 5,
      },
      {
        id: `wo-tech-${technicianId}-5`,
        title: 'Toilet Running Continuously',
        description: 'Toilet tank fills and drains constantly.',
        status: 'completed',
        priority: 'medium',
        customer: baseCustomers[(techIndex + 4) % baseCustomers.length],
        technician: assignedTech,
        scheduledDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        estimatedDuration: 45,
        actualDuration: 40,
        location: baseCustomers[(techIndex + 4) % baseCustomers.length].location,
        category: 'Plumbing',
        notes: ['Replaced flapper valve'],
        attachments: [],
        rating: 4,
      },
    ]
  }
}

// 为不同角色生成技术员数据
export function generateTechniciansByRole(role: UserRole, technicianId?: string): Technician[] {
  if (role === 'admin') {
    // Admin 看到所有技术员
    return mockTechnicians
  } else {
    // Technician 只看到自己
    const tech = mockTechnicians.find(t => t.id === technicianId)
    return tech ? [tech] : []
  }
}

// 为不同角色生成客户数据
export function generateCustomersByRole(role: UserRole): Customer[] {
  if (role === 'admin') {
    // Admin 看到所有客户
    return mockCustomers
  } else {
    // Technician 只看到与自己工单相关的客户
    return mockCustomers.slice(0, 5)
  }
}

// 为不同角色生成仪表盘统计数据
export function generateDashboardStatsByRole(
  role: UserRole,
  workOrders: WorkOrder[]
): DashboardStats {
  if (role === 'admin') {
    // Admin 看到全局统计：大规模运营数据
    const completedToday = workOrders.filter(
      wo => wo.status === 'completed' && 
      new Date(wo.completedDate || '').toDateString() === new Date().toDateString()
    ).length
    
    const inProgress = workOrders.filter(wo => wo.status === 'in-progress').length
    
    return {
      totalOrders: 342,
      completedToday,
      inProgress,
      avgResponseTime: 18, // minutes
      customerSatisfaction: 4.7,
      revenue: 128450, // dollars
      activeTechnicians: 12, // active technicians count
    }
  } else {
    // Technician 看到个人统计：聚焦个人绩效
    const completedToday = workOrders.filter(
      wo => wo.status === 'completed' && 
      new Date(wo.completedDate || '').toDateString() === new Date().toDateString()
    ).length
    
    const inProgress = workOrders.filter(wo => wo.status === 'in-progress').length
    
    return {
      totalOrders: workOrders.length,
      completedToday,
      inProgress,
      avgResponseTime: 22, // personal avg response time
      customerSatisfaction: 4.9, // personal rating
      revenue: 0, // technicians don't see revenue
      activeTechnicians: 0, // not visible to technicians
    }
  }
}
