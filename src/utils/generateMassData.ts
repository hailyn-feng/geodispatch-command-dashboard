// 生成大量模拟工单点位用于地图聚合展示（优化为1000条）
import { WorkOrder, Customer, Technician } from '@/types'

const NY_BOUNDS = {
  minLat: 40.4774,
  maxLat: 40.9176,
  minLng: -74.2591,
  maxLng: -73.7004,
}

const STREET_NAMES = [
  'Broadway', 'Park Ave', 'Madison Ave', '5th Ave', 'Lexington Ave',
  'Amsterdam Ave', 'Columbus Ave', 'West End Ave', 'Riverside Dr',
  'Central Park West', 'York Ave', 'First Ave', 'Second Ave', 'Third Ave',
  'Main St', 'Wall St', 'Canal St', 'Houston St', 'Bleecker St',
  'Spring St', 'Prince St', 'Lafayette St', 'Bowery', 'Allen St'
]

const AREAS = [
  'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island',
  'Upper East Side', 'Upper West Side', 'Midtown', 'Downtown',
  'Chelsea', 'Greenwich Village', 'SoHo', 'Tribeca', 'Harlem'
]

const PRIORITIES: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent']
const STATUSES: Array<'pending' | 'assigned' | 'in-progress' | 'completed'> = ['pending', 'assigned', 'in-progress', 'completed']

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateCustomer(id: number): Customer {
  const lat = randomInRange(NY_BOUNDS.minLat, NY_BOUNDS.maxLat)
  const lng = randomInRange(NY_BOUNDS.minLng, NY_BOUNDS.maxLng)
  const streetNum = Math.floor(Math.random() * 9999) + 1
  const street = randomElement(STREET_NAMES)
  const area = randomElement(AREAS)
  const address = `${streetNum} ${street}, ${area}, NY`

  return {
    id: `c${id}`,
    name: `Customer ${id}`,
    email: `customer${id}@email.com`,
    phone: `+1 (555) ${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    address,
    location: { lat, lng, address },
    totalOrders: Math.floor(Math.random() * 20) + 1,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
  }
}

export function generateMassWorkOrders(count: number, technicians: Technician[]): WorkOrder[] {
  const orders: WorkOrder[] = []
  
  for (let i = 0; i < count; i++) {
    const customer = generateCustomer(i + 1000)
    const status = randomElement(STATUSES)
    const priority = randomElement(PRIORITIES)
    const hasTech = status !== 'pending' && Math.random() > 0.3
    const technician = hasTech ? randomElement(technicians) : undefined

    orders.push({
      id: `wo-mass-${i}`,
      title: `Service Request ${i + 1}`,
      description: 'Auto-generated service order for demo purposes',
      status,
      priority,
      customer,
      technician,
      scheduledDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: Math.floor(Math.random() * 180) + 30, // 30-210 min
      location: customer.location,
      category: randomElement(['HVAC', 'Plumbing', 'Electrical', 'General Repair']),
      notes: [],
      attachments: [],
    })
  }

  return orders
}
