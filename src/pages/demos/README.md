# 客户演示页面使用指南

## 📁 目录结构

```
src/pages/demos/
├── README.md          # 本文档
├── DemoIndex.tsx      # Demo 列表索引页
└── Demo1.tsx          # Demo 示例模板
```

## 🚀 快速开始

### 访问 Demo 页面

- **Demo 列表页**: `http://localhost:5173/demos`
- **Demo 1**: `http://localhost:5173/demos/demo1`

### 添加新的 Demo 页面

#### 步骤 1: 创建新的 Demo 组件

在 `src/pages/demos/` 目录下创建新文件，例如 `Demo2.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Demo2() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* 返回按钮 */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/demos"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
      </div>

      {/* 你的演示内容 */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <h1 className="text-4xl font-bold">Demo 2 内容</h1>
      </div>
    </div>
  )
}
```

#### 步骤 2: 在 App.tsx 添加路由

打开 `src/App.tsx`，在导入部分添加：

```tsx
import Demo2 from './pages/demos/Demo2'
```

在 `/demos` 路由下添加：

```tsx
<Route path="/demos" element={<DemoLayout />}>
  <Route index element={<DemoIndex />} />
  <Route path="demo1" element={<Demo1 />} />
  <Route path="demo2" element={<Demo2 />} />  {/* 新增 */}
</Route>
```

#### 步骤 3: 在列表页添加入口（可选）

打开 `src/pages/demos/DemoIndex.tsx`，在 `demos` 数组中添加：

```tsx
const demos = [
  {
    id: 'demo1',
    title: 'Demo 示例 1',
    description: '这是第一个演示案例的描述',
    path: '/demos/demo1',
  },
  {
    id: 'demo2',
    title: '新功能演示',
    description: '展示产品的核心功能特性',
    path: '/demos/demo2',
  },
]
```

## 💡 设计建议

### 演示页面的特点

- ✅ **全屏干净**: 无导航栏，专注内容展示
- ✅ **视觉吸引**: 使用渐变背景、动画效果
- ✅ **简洁明了**: 突出核心功能，避免信息过载
- ✅ **响应式**: 适配不同屏幕尺寸

### 推荐的演示场景

1. **产品功能展示**: 演示单个核心功能的使用流程
2. **交互原型**: 展示新功能的交互设计
3. **数据可视化**: 展示实时数据图表、地图等
4. **对比演示**: 前后对比、A/B 方案对比
5. **客户定制化方案**: 针对特定客户的定制演示

## 🎨 样式资源

项目已集成 Tailwind CSS 和 Lucide React 图标库：

- Tailwind 渐变色: `bg-gradient-to-br from-blue-50 to-indigo-100`
- 图标使用: `import { Icon } from 'lucide-react'`

## 📝 注意事项

1. **路径命名**: 使用语义化的路径，如 `/demos/product-feature`
2. **返回按钮**: 每个 demo 页面都应该有返回列表的按钮
3. **独立性**: 每个 demo 应该是独立的，不依赖其他页面状态
4. **性能**: 避免过重的动画和资源加载

## 🔗 相关文件

- 路由配置: `src/App.tsx`
- Demo 布局: `src/layouts/DemoLayout.tsx`
- Demo 列表: `src/pages/demos/DemoIndex.tsx`
