import { useEffect, useState } from 'react'
import { Plus, Search, Store, Pencil, Trash2, X } from 'lucide-react'
import api from '../services/api.js'
import MainLayout from '../layouts/MainLayout.jsx'

const STATUT_STYLES = {
  operationnel: 'bg-emerald-50 text-emerald-700',
  en_panne: 'bg-rose-50 text-rose-700',
  maintenance: 'bg-amber-50 text-amber-700',
  ferme: 'bg-slate-100 text-slate-500',
}

export default function Magasins() {
  const [magasins, setMagasins] = useState([])
  const [businessUnits, setBusinessUnits] = useState([])
  const [search, setSearch] = useState('')
  const [buFilter, setBuFilter] = useState('')
  const [loading, setLoading] = useState(true)

  // États pour la création
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [newMagasin, setNewMagasin] = useState({
    nom: '',
    code: '',
    business_unit_id: '',
    ville: '',
    nombre_caisses: 0,
    nombre_balances: 0,
    statut: 'operationnel',
  })

  // États pour l'édition
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMagasin, setEditingMagasin] = useState(null)
  const [editData, setEditData] = useState(null)

  // États pour la suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deletingName, setDeletingName] = useState('')

  const load = () => {
    setLoading(true)
    api
      .get('/magasins', { params: { search, business_unit_id: buFilter || undefined } })
      .then((res) => setMagasins(res.data.data ?? res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get('/business-units').then((res) => setBusinessUnits(res.data.data ?? res.data))
  }, [])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, buFilter])

  // --- Création ---
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await api.post('/magasins', newMagasin)
      setShowCreateModal(false)
      setNewMagasin({
        nom: '',
        code: '',
        business_unit_id: '',
        ville: '',
        nombre_caisses: 0,
        nombre_balances: 0,
        statut: 'operationnel',
      })
      load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de la création.')
    } finally {
      setSubmitting(false)
    }
  }

  // --- Édition ---
  const openEditModal = (magasin) => {
    setEditingMagasin(magasin)
    setEditData({
      nom: magasin.nom,
      code: magasin.code,
      business_unit_id: magasin.business_unit_id,
      ville: magasin.ville || '',
      nombre_caisses: magasin.nombre_caisses,
      nombre_balances: magasin.nombre_balances,
      statut: magasin.statut,
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await api.put(`/magasins/${editingMagasin.id}`, editData)
      setShowEditModal(false)
      setEditingMagasin(null)
      setEditData(null)
      load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de la mise à jour.')
    } finally {
      setSubmitting(false)
    }
  }

  // --- Suppression ---
  const openDeleteModal = (id, nom) => {
    setDeletingId(id)
    setDeletingName(nom)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await api.delete(`/magasins/${deletingId}`)
      setShowDeleteModal(false)
      setDeletingId(null)
      setDeletingName('')
      load()
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
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Magasins</h1>
          <p className="text-slate-500">Gérez l'ensemble de vos points de vente</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Nouveau magasin
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un magasin..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={buFilter}
          onChange={(e) => setBuFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les Business Units</option>
          {businessUnits.map((bu) => (
            <option key={bu.id} value={bu.id}>
              {bu.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-6 py-3 font-semibold">Magasin</th>
              <th className="text-left px-6 py-3 font-semibold">Business Unit</th>
              <th className="text-left px-6 py-3 font-semibold">Ville</th>
              <th className="text-left px-6 py-3 font-semibold">Caisses</th>
              <th className="text-left px-6 py-3 font-semibold">Balances</th>
              <th className="text-left px-6 py-3 font-semibold">Statut</th>
              <th className="text-center px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  Chargement...
                </td>
              </tr>
            )}
            {!loading && magasins.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  Aucun magasin trouvé.
                </td>
              </tr>
            )}
            {magasins.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                  <Store size={16} className="text-slate-400" /> {m.nom}
                  <span className="text-xs text-slate-400">({m.code})</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{m.business_unit?.nom}</td>
                <td className="px-6 py-4 text-slate-600">{m.ville || '—'}</td>
                <td className="px-6 py-4 text-slate-600">{m.nombre_caisses}</td>
                <td className="px-6 py-4 text-slate-600">{m.nombre_balances}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUT_STYLES[m.statut]}`}>
                    {m.statut}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(m.id, m.nom)}
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

      {/* Modal Création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Nouveau magasin</h2>
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
                    value={newMagasin.nom}
                    onChange={(e) => setNewMagasin({ ...newMagasin, nom: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={newMagasin.code}
                    onChange={(e) => setNewMagasin({ ...newMagasin, code: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Unit *</label>
                  <select
                    value={newMagasin.business_unit_id}
                    onChange={(e) => setNewMagasin({ ...newMagasin, business_unit_id: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une BU</option>
                    {businessUnits.map((bu) => (
                      <option key={bu.id} value={bu.id}>
                        {bu.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={newMagasin.ville}
                    onChange={(e) => setNewMagasin({ ...newMagasin, ville: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Caisses</label>
                    <input
                      type="number"
                      min="0"
                      value={newMagasin.nombre_caisses}
                      onChange={(e) =>
                        setNewMagasin({ ...newMagasin, nombre_caisses: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Balances</label>
                    <input
                      type="number"
                      min="0"
                      value={newMagasin.nombre_balances}
                      onChange={(e) =>
                        setNewMagasin({ ...newMagasin, nombre_balances: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    value={newMagasin.statut}
                    onChange={(e) => setNewMagasin({ ...newMagasin, statut: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="operationnel">Opérationnel</option>
                    <option value="en_panne">En panne</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="ferme">Fermé</option>
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

      {/* Modal Édition */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Modifier le magasin</h2>
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
                    value={editData.nom}
                    onChange={(e) => setEditData({ ...editData, nom: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={editData.code}
                    onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Unit *</label>
                  <select
                    value={editData.business_unit_id}
                    onChange={(e) => setEditData({ ...editData, business_unit_id: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une BU</option>
                    {businessUnits.map((bu) => (
                      <option key={bu.id} value={bu.id}>
                        {bu.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={editData.ville}
                    onChange={(e) => setEditData({ ...editData, ville: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Caisses</label>
                    <input
                      type="number"
                      min="0"
                      value={editData.nombre_caisses}
                      onChange={(e) =>
                        setEditData({ ...editData, nombre_caisses: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Balances</label>
                    <input
                      type="number"
                      min="0"
                      value={editData.nombre_balances}
                      onChange={(e) =>
                        setEditData({ ...editData, nombre_balances: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    value={editData.statut}
                    onChange={(e) => setEditData({ ...editData, statut: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="operationnel">Opérationnel</option>
                    <option value="en_panne">En panne</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="ferme">Fermé</option>
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

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Confirmer la suppression</h2>
            <p className="text-slate-500 mb-4">
              Êtes-vous sûr de vouloir supprimer le magasin <strong>{deletingName}</strong> ? Cette action est irréversible.
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