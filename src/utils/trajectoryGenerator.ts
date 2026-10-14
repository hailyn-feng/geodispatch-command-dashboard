// 生成车辆轨迹数据的工具函数
export function generateVehicleTrajectory(
  _vehicleId: string,
  _licensePlate: string,
  startLat: number,
  startLng: number,
  points: number = 50
): Array<{ lat: number; lng: number; time: string; speed: number }> {
  const trajectory = []
  let lat = startLat
  let lng = startLng
  
  for (let i = 0; i < points; i++) {
    const hour = 8 + Math.floor(i / 10)
    const minute = (i % 10) * 6
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    const speed = 15 + Math.floor(Math.random() * 20)
    
    trajectory.push({ lat, lng, time, speed })
    
    // 随机移动，但保持在合理范围内
    const angle = Math.random() * Math.PI * 2
    const distance = 0.001 + Math.random() * 0.0015 // 缩小到原来的一半，让轨迹更紧凑
    lat += Math.cos(angle) * distance
    lng += Math.sin(angle) * distance
    
    // 保持在NYC范围内
    lat = Math.max(40.70, Math.min(40.80, lat))
    lng = Math.max(-74.02, Math.min(-73.95, lng))
  }
  
  return trajectory
}
