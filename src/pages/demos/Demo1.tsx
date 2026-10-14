import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'

/**
 * Demo1 - 演示案例模板
 * 
 * 复制此文件创建新的演示页面
 */
export default function Demo1() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* 返回按钮 */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/demos"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 hover:text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">返回列表</span>
        </Link>
      </div>

      {/* 演示内容区域 */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="max-w-4xl w-full">
          {/* 示例卡片 */}
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Demo 演示案例 1
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              这是一个客户演示页面模板。<br />
              你可以在这里展示产品功能、特性演示、交互原型等内容。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-3xl font-bold text-indigo-600 mb-2">特性 1</div>
                <p className="text-gray-600 text-sm">展示核心功能点</p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">特性 2</div>
                <p className="text-gray-600 text-sm">突出技术优势</p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">特性 3</div>
                <p className="text-gray-600 text-sm">客户价值体现</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">
                💡 提示：修改 <code className="bg-white px-2 py-1 rounded text-indigo-600">src/pages/demos/Demo1.tsx</code> 来定制这个演示页面
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
