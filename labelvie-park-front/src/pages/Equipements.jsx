import { useEffect, useState } from 'react'
import { Plus, Laptop, Pencil, Trash2, X } from 'lucide-react'
import api from '../services/api.js'
import MainLayout from '../layouts/MainLayout.jsx'

const STATUT_STYLES = {
  actif: 'bg-emerald-50 text-emerald-700',
  en_panne: 'bg-rose-50 text-rose-700',
  maintenance: 'bg-amber-50 text-amber-700',
  hors_service: 'bg-slate-100 text-slate-500',
}

const TYPES = ['Ordinateur', 'Imprimante', 'Scanner', 'Serveur', 'Switch', 'Routeur', 'Écran', 'Autre']

export default function Equipements() {
  const [equipements, setEquipements] = useState([])
  const [magasins, setMagasins] = useState([])
  const [loading, setLoading] = useState(true)

  // --- États pour la création ---
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [newEquipement, setNewEquipement] = useState({
    type: '',
    marque: '',
    modele: '',
    numero_serie: '',
    magasin_id: '',
    statut: 'actif',
  })

  // --- États pour l'édition ---
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEquipement, setEditingEquipement] = useState(null)
  const [editData, setEditData] = useState(null)

  // --- États pour la suppression ---
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deletingName, setDeletingName] = useState('')

  // Chargement des équipements
  const loadEquipements = () => {
    setLoading(true)
    api
      .get('/equipements')
      .then((res) => setEquipements(res.data.data ?? res.data))
      .catch((err) => console.error('Erreur chargement équipements :', err))
      .finally(() => setLoading(false))
  }

  // Chargement des magasins (corrigé)
  const loadMagasins = () => {
    api
      .get('/magasins')
      .then((res) => {
        // Gère les deux structures possibles
        const magasinsData = res.data.data ?? res.data
        setMagasins(magasinsData)
      })
      .catch((err) => console.error('Erreur chargement magasins :', err))
  }

  // Chargement initial
  useEffect(() => {
    loadEquipements()
    loadMagasins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Création ---
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await api.post('/equipements', newEquipement)
      setShowCreateModal(false)
      setNewEquipement({
        type: '',
        marque: '',
        modele: '',
        numero_serie: '',
        magasin_id: '',
        statut: 'actif',
      })
      loadEquipements()
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
  const openEditModal = (equipement) => {
    setEditingEquipement(equipement)
    setEditData({
      type: equipement.type,
      marque: equipement.marque || '',
      modele: equipement.modele || '',
      numero_serie: equipement.numero_serie || '',
      magasin_id: equipement.magasin_id || '',
      statut: equipement.statut,
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await api.put(`/equipements/${editingEquipement.id}`, editData)
      setShowEditModal(false)
      setEditingEquipement(null)
      setEditData(null)
      loadEquipements()
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
      await api.delete(`/equipements/${deletingId}`)
      setShowDeleteModal(false)
      setDeletingId(null)
      setDeletingName('')
      loadEquipements()
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
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Équipements</h1>
          <p className="text-slate-500">Suivez l'état de votre parc informatique</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Nouvel équipement
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-6 py-3 font-semibold">Équipement</th>
              <th className="text-left px-6 py-3 font-semibold">Magasin</th>
              <th className="text-left px-6 py-3 font-semibold">N° série</th>
              <th className="text-left px-6 py-3 font-semibold">Statut</th>
              <th className="text-center px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Chargement...
                </td>
              </tr>
            )}
            {!loading && equipements.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Aucun équipement trouvé.
                </td>
              </tr>
            )}
            {equipements.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                  <Laptop size={16} className="text-slate-400" />
                  {e.type} {e.marque ? `- ${e.marque}` : ''}
                  {e.modele && <span className="text-xs text-slate-400">({e.modele})</span>}
                </td>
                <td className="px-6 py-4 text-slate-600">{e.magasin?.nom || '—'}</td>
                <td className="px-6 py-4 text-slate-600">{e.numero_serie || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUT_STYLES[e.statut]}`}>
                    {e.statut}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(e)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(e.id, `${e.type} ${e.marque || ''}`)}
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
            <h2 className="text-xl font-bold text-slate-900 mb-1">Nouvel équipement</h2>
            <p className="text-slate-500 text-sm mb-4">Remplissez les informations ci-dessous.</p>
            {formError && (
              <div className="bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2 mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                  <select
                    value={newEquipement.type}
                    onChange={(e) => setNewEquipement({ ...newEquipement, type: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez un type</option>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marque</label>
                  <input
                    type="text"
                    value={newEquipement.marque}
                    onChange={(e) => setNewEquipement({ ...newEquipement, marque: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
                  <input
                    type="text"
                    value={newEquipement.modele}
                    onChange={(e) => setNewEquipement({ ...newEquipement, modele: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de série</label>
                  <input
                    type="text"
                    value={newEquipement.numero_serie}
                    onChange={(e) => setNewEquipement({ ...newEquipement, numero_serie: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Magasin</label>
                  <select
                    value={newEquipement.magasin_id}
                    onChange={(e) => setNewEquipement({ ...newEquipement, magasin_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun</option>
                    {magasins.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    value={newEquipement.statut}
                    onChange={(e) => setNewEquipement({ ...newEquipement, statut: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="actif">Actif</option>
                    <option value="en_panne">En panne</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="hors_service">Hors service</option>
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
            <h2 className="text-xl font-bold text-slate-900 mb-1">Modifier l'équipement</h2>
            <p className="text-slate-500 text-sm mb-4">Mettez à jour les informations.</p>
            {formError && (
              <div className="bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2 mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                  <select
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez un type</option>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marque</label>
                  <input
                    type="text"
                    value={editData.marque}
                    onChange={(e) => setEditData({ ...editData, marque: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
                  <input
                    type="text"
                    value={editData.modele}
                    onChange={(e) => setEditData({ ...editData, modele: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de série</label>
                  <input
                    type="text"
                    value={editData.numero_serie}
                    onChange={(e) => setEditData({ ...editData, numero_serie: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Magasin</label>
                  <select
                    value={editData.magasin_id}
                    onChange={(e) => setEditData({ ...editData, magasin_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun</option>
                    {magasins.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    value={editData.statut}
                    onChange={(e) => setEditData({ ...editData, statut: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="actif">Actif</option>
                    <option value="en_panne">En panne</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="hors_service">Hors service</option>
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
              Êtes-vous sûr de vouloir supprimer l'équipement <strong>{deletingName}</strong> ? Cette action est irréversible.
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