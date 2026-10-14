import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Search, Phone, Mail, MapPin, Star, Calendar, Plus, Edit2, Trash2, X } from 'lucide-react'
import { Customer } from '@/types'

export default function Customers() {
  const { customers, workOrders, addCustomer, updateCustomer, deleteCustomer } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  const getCustomerOrders = (customerId: string) => {
    return workOrders.filter(order => order.customer.id === customerId)
  }

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      })
    } else {
      setEditingCustomer(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCustomer(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      })
    } else {
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        location: { lat: 34.0522, lng: -118.2437, address: formData.address },
        totalOrders: 0,
        rating: 5.0,
      }
      addCustomer(newCustomer)
    }
    
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    deleteCustomer(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your customer base
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {customers.length}
              </p>
            </div>
            <div className="bg-blue-500 h-12 w-12 rounded-lg opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {(customers.reduce((sum, c) => sum + c.rating, 0) / customers.length).toFixed(1)}
              </p>
            </div>
            <div className="bg-yellow-500 h-12 w-12 rounded-lg opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
              </p>
            </div>
            <div className="bg-green-500 h-12 w-12 rounded-lg opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {workOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}
              </p>
            </div>
            <div className="bg-purple-500 h-12 w-12 rounded-lg opacity-20" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recent Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.map((customer) => {
                const customerOrders = getCustomerOrders(customer.id)
                const recentOrders = customerOrders
                  .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
                  .slice(0, 3)

                return (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-800 dark:text-primary-400 font-semibold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {customer.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{customer.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.totalOrders}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"
                          >
                            <span className={`w-2 h-2 rounded-full ${
                              order.status === 'completed' ? 'bg-green-500' :
                              order.status === 'in-progress' ? 'bg-blue-500' :
                              order.status === 'assigned' ? 'bg-purple-500' :
                              order.status === 'pending' ? 'bg-yellow-500' :
                              'bg-gray-400'
                            }`} />
                            <span className="truncate max-w-[150px]">{order.title}</span>
                          </div>
                        ))}
                        {recentOrders.length === 0 && (
                          <span className="text-xs text-gray-400">No orders yet</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(customer)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(customer.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No customers found</p>
          </div>
        )}
      </div>

      {/* Top Customers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-500" />
          Top Customers
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...customers]
            .sort((a, b) => b.totalOrders - a.totalOrders)
            .slice(0, 6)
            .map((customer) => (
              <div
                key={customer.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-800 dark:text-primary-400 font-semibold text-lg">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {customer.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Orders</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {customer.totalOrders}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
                    <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{customer.address}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Customer
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
