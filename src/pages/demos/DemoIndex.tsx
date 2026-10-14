import { Link } from 'react-router-dom'
import { FileText, Presentation } from 'lucide-react'

/**
 * Demo 列表索引页
 * 方便管理和快速访问所有演示案例
 */
export default function DemoIndex() {
  const demos = [
    {
      id: 'demo1',
      title: 'Demo 示例 1',
      description: '这是第一个演示案例的描述',
      path: '/demos/demo1',
    },
    // 可以继续添加更多 demo
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 页头 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Presentation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            客户演示案例
          </h1>
          <p className="text-gray-600 text-lg">
            选择一个演示案例向客户展示产品功能
          </p>
        </div>

        {/* Demo 列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((demo) => (
            <Link
              key={demo.id}
              to={demo.path}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-400"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {demo.title}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {demo.description}
                </p>
                <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                  查看演示
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 添加提示 */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            💡 如何添加新的演示案例
          </h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>在 <code className="bg-gray-100 px-2 py-0.5 rounded">src/pages/demos/</code> 创建新的页面组件</li>
            <li>在 <code className="bg-gray-100 px-2 py-0.5 rounded">src/App.tsx</code> 添加对应路由</li>
            <li>在本页面的 demos 数组中添加入口链接</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
