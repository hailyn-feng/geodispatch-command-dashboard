import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AdminLayout from './layouts/AdminLayout'
import ScreenLayout from './layouts/ScreenLayout'
import DemoLayout from './layouts/DemoLayout'

// Admin pages
import Dashboard from './pages/admin/Dashboard'
import DispatchBoard from './pages/admin/DispatchBoard'
import WorkOrders from './pages/admin/WorkOrders'
import WorkOrderDetail from './pages/admin/WorkOrderDetail'
import Technicians from './pages/admin/Technicians'
import Customers from './pages/admin/Customers'
import MapDispatch from './pages/admin/MapDispatch'
import TechnicianMobile from './pages/admin/TechnicianMobile'
import TechnicianSchedule from './pages/admin/TechnicianSchedule'

// Screen pages
import ScreenView from './pages/screen/ScreenView'

// Demo pages
import DemoIndex from './pages/demos/DemoIndex'
import Demo1 from './pages/demos/Demo1'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/screen" replace />} />

        {/* Admin routes (Admin panel) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/schedule" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dispatch" element={<DispatchBoard />} />
          <Route path="schedule" element={<TechnicianSchedule />} />
          <Route path="map-dispatch" element={<MapDispatch />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="work-orders/:id" element={<WorkOrderDetail />} />
          <Route path="technicians" element={<Technicians />} />
          <Route path="customers" element={<Customers />} />
          <Route path="mobile" element={<TechnicianMobile />} />
        </Route>

        {/* Screen routes (大屏展示) */}
        <Route path="/screen" element={<ScreenLayout />}>
          <Route index element={<ScreenView />} />
        </Route>

        {/* Demo routes (客户演示页面) */}
        <Route path="/demos" element={<DemoLayout />}>
          <Route index element={<DemoIndex />} />
          <Route path="demo1" element={<Demo1 />} />
          {/* 添加更多 demo 路由在这里 */}
        </Route>
      </Routes>
    </BrowserRouter>
    
    {/* Toast Notifications */}
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#fff',
          borderRadius: '8px',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  </>
  )
}

export default App
