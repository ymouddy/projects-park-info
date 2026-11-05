import { useEffect, useState } from 'react'
import { Plus, Search, UserCircle, Pencil, Trash2, X } from 'lucide-react'
import api from '../services/api.js'
import MainLayout from '../layouts/MainLayout.jsx'

const ROLE_STYLES = {
  admin: 'bg-violet-50 text-violet-700',
  gestionnaire: 'bg-blue-50 text-blue-700',
  technicien: 'bg-amber-50 text-amber-700',
  utilisateur: 'bg-slate-100 text-slate-600',
}

const ROLE_OPTIONS = ['admin', 'gestionnaire', 'technicien', 'utilisateur']

export default function Utilisateurs() {
  const [users, setUsers] = useState([])
  const [magasins, setMagasins] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // --- États pour la création ---
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'utilisateur',
    magasin_id: '',
    actif: true,
  })

  // --- États pour l'édition ---
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editData, setEditData] = useState(null)

  // --- États pour la suppression ---
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deletingName, setDeletingName] = useState('')

  // Chargement des utilisateurs
  const loadUsers = () => {
    setLoading(true)
    api
      .get('/users', { params: { search } })
      .then((res) => setUsers(res.data.data ?? res.data))
      .catch((err) => console.error('Erreur chargement utilisateurs :', err))
      .finally(() => setLoading(false))
  }

  // Chargement des magasins pour les selects
  const loadMagasins = () => {
    api
      .get('/magasins')
      .then((res) => setMagasins(res.data.data ?? res.data))
      .catch((err) => console.error('Erreur chargement magasins :', err))
  }

  useEffect(() => {
    loadMagasins()
    // Déclenche le chargement initial via le debounce
    const t = setTimeout(loadUsers, 100)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce sur la recherche
  useEffect(() => {
    const t = setTimeout(loadUsers, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // --- Création ---
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await api.post('/users', newUser)
      setShowCreateModal(false)
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'utilisateur',
        magasin_id: '',
        actif: true,
      })
      loadUsers()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const messages = Object.values(errors).flat()
        setFormError(messages.join(' '))
      } else {
        setFormError(err.response?.data?.message || 'Erreur lors de la création.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // --- Édition ---
  const openEditModal = (user) => {
    setEditingUser(user)
    setEditData({
      name: user.name,
      email: user.email,
      role: user.role,
      magasin_id: user.magasin_id || '',
      actif: user.actif,
      // Le champ password n'est pas pré-rempli pour la sécurité
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      const payload = { ...editData }
      // Si le mot de passe est vide, on ne l'envoie pas pour ne pas le modifier
      if (payload.password === '') delete payload.password
      await api.put(`/users/${editingUser.id}`, payload)
      setShowEditModal(false)
      setEditingUser(null)
      setEditData(null)
      loadUsers()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const messages = Object.values(errors).flat()
        setFormError(messages.join(' '))
      } else {
        setFormError(err.response?.data?.message || 'Erreur lors de la mise à jour.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // --- Suppression ---
  const openDeleteModal = (id, name) => {
    setDeletingId(id)
    setDeletingName(name)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await api.delete(`/users/${deletingId}`)
      setShowDeleteModal(false)
      setDeletingId(null)
      setDeletingName('')
      loadUsers()
    } catch (err) {
      alert('Erreur lors de la suppression.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Utilisateurs</h1>
          <p className="text-slate-500">Gérez les accès et les rôles de vos équipes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Nouvel utilisateur
        </button>
      </div>

      <div className="relative max-w-md mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-6 py-3 font-semibold">Utilisateur</th>
              <th className="text-left px-6 py-3 font-semibold">Email</th>
              <th className="text-left px-6 py-3 font-semibold">Rôle</th>
              <th className="text-left px-6 py-3 font-semibold">Magasin</th>
              <th className="text-left px-6 py-3 font-semibold">Statut</th>
              <th className="text-center px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Chargement...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                  <UserCircle size={18} className="text-slate-400" /> {u.name}
                </td>
                <td className="px-6 py-4 text-slate-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_STYLES[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{u.magasin?.nom || '—'}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {u.actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(u.id, u.name)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Modal Création --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Nouvel utilisateur</h2>
            <p className="text-slate-500 text-sm mb-4">Remplissez les informations ci-dessous.</p>
            {formError && (
              <div className="bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2 mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rôle *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Magasin</label>
                  <select
                    value={newUser.magasin_id}
                    onChange={(e) => setNewUser({ ...newUser, magasin_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun (accès global)</option>
                    {magasins.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Actif</label>
                  <select
                    value={newUser.actif ? '1' : '0'}
                    onChange={(e) => setNewUser({ ...newUser, actif: e.target.value === '1' })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Actif</option>
                    <option value="0">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal Édition --- */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Modifier l'utilisateur</h2>
            <p className="text-slate-500 text-sm mb-4">Mettez à jour les informations.</p>
            {formError && (
              <div className="bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2 mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nouveau mot de passe (laisser vide pour ne pas changer)
                  </label>
                  <input
                    type="password"
                    value={editData.password || ''}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    minLength={8}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rôle *</label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Magasin</label>
                  <select
                    value={editData.magasin_id}
                    onChange={(e) => setEditData({ ...editData, magasin_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun (accès global)</option>
                    {magasins.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Actif</label>
                  <select
                    value={editData.actif ? '1' : '0'}
                    onChange={(e) => setEditData({ ...editData, actif: e.target.value === '1' })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Actif</option>
                    <option value="0">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal Suppression --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Confirmer la suppression</h2>
            <p className="text-slate-500 mb-4">
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{deletingName}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}