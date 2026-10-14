import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Search, MapPin, Phone, Mail, Star, TrendingUp, Plus, Edit2, Trash2, X } from 'lucide-react'
import { Technician } from '@/types'

export default function Technicians() {
  const { technicians, updateTechnicianStatus, addTechnician, updateTechnician, deleteTechnician } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    avatar: '',
  })

  const filteredTechnicians = technicians.filter((tech) =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const stats = {
    total: technicians.length,
    available: technicians.filter(t => t.status === 'available').length,
    busy: technicians.filter(t => t.status === 'busy').length,
    onBreak: technicians.filter(t => t.status === 'on-break').length,
  }

  const handleOpenModal = (technician?: Technician) => {
    if (technician) {
      setEditingTechnician(technician)
      setFormData({
        name: technician.name,
        email: technician.email,
        phone: technician.phone,
        skills: technician.skills.join(', '),
        avatar: technician.avatar,
      })
    } else {
      setEditingTechnician(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        skills: '',
        avatar: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTechnician(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      skills: '',
      avatar: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    
    if (editingTechnician) {
      updateTechnician(editingTechnician.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        skills: skillsArray,
        avatar: formData.avatar || `https://i.pravatar.cc/150?u=${formData.email}`,
      })
    } else {
      const newTechnician: Technician = {
        id: `tech-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        skills: skillsArray,
        status: 'available',
        currentLocation: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
        avatar: formData.avatar || `https://i.pravatar.cc/150?u=${formData.email}`,
        rating: 5.0,
        completedToday: 0,
        assignedOrders: 0,
      }
      addTechnician(newTechnician)
    }
    
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    deleteTechnician(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Technicians</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your field service team
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Technician
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="bg-blue-500 h-12 w-12 rounded-lg opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.available}
              </p>
            </div>
            <div className="bg-green-500 h-12 w-12 rounded-lg opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Busy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.busy}
              </p>
            </div>
            <div className="bg-blue-500 h-12 w-12 rounded-lg opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">On Break</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.onBreak}
              </p>
            </div>
            <div className="bg-yellow-500 h-12 w-12 rounded-lg opacity-20" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search technicians..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTechnicians.map((tech) => (
          <div
            key={tech.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <img
                  src={tech.avatar}
                  alt={tech.name}
                  className="w-16 h-16 rounded-full"
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  tech.status === 'available' ? 'bg-green-500' :
                  tech.status === 'busy' ? 'bg-blue-500' :
                  tech.status === 'on-break' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {tech.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {tech.status.replace('-', ' ')}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {tech.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{tech.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{tech.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{tech.currentLocation.address}</span>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-1">
                {tech.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Assigned</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tech.assignedOrders}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completed Today</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tech.completedToday}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <select
                value={tech.status}
                onChange={(e) => updateTechnicianStatus(tech.id, e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="on-break">On Break</option>
                <option value="offline">Offline</option>
              </select>
              <button
                onClick={() => handleOpenModal(tech)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit Technician"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setDeleteConfirm(tech.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Technician"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTechnician ? 'Edit Technician' : 'Add New Technician'}
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
                  Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="HVAC, Plumbing, Electrical"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Avatar URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
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
                  {editingTechnician ? 'Update' : 'Create'}
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
              Delete Technician
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this technician? This action cannot be undone.
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

      {filteredTechnicians.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No technicians found</p>
        </div>
      )}

      {/* Performance Leaders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Top Performers Today
        </h2>
        <div className="space-y-3">
          {[...technicians]
            .sort((a, b) => b.completedToday - a.completedToday)
            .slice(0, 5)
            .map((tech, index) => (
              <div
                key={tech.id}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 font-bold">
                  {index + 1}
                </div>
                <img
                  src={tech.avatar}
                  alt={tech.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {tech.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {tech.completedToday} orders completed
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {tech.rating}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
