import { Outlet } from 'react-router-dom'

/**
 * DemoLayout - 客户演示专用布局
 * 
 * 特点：
 * - 全屏干净的展示界面
 * - 无导航栏、无多余元素
 * - 适合向客户演示产品功能
 */
export default function DemoLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full h-full">
        <Outlet />
      </main>
    </div>
  )
}
