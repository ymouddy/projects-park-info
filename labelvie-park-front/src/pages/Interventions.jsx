import { useEffect, useState } from 'react'
import { Plus, Wrench, Pencil, Trash2, X } from 'lucide-react'
import api from '../services/api.js'
import MainLayout from '../layouts/MainLayout.jsx'

const STATUT_STYLES = {
  ouverte: 'bg-blue-50 text-blue-700',
  en_cours: 'bg-amber-50 text-amber-700',
  resolue: 'bg-emerald-50 text-emerald-700',
  annulee: 'bg-slate-100 text-slate-500',
}

const PRIORITE_STYLES = {
  basse: 'bg-slate-100 text-slate-500',
  normale: 'bg-blue-50 text-blue-700',
  haute: 'bg-amber-50 text-amber-700',
  critique: 'bg-rose-50 text-rose-700',
}

const TYPE_OPTIONS = ['preventive', 'curative', 'installation', 'autre']
const STATUT_OPTIONS = ['ouverte', 'en_cours', 'resolue', 'annulee']
const PRIORITE_OPTIONS = ['basse', 'normale', 'haute', 'critique']

export default function Interventions() {
  const [interventions, setInterventions] = useState([])
  const [equipements, setEquipements] = useState([])
  const [techniciens, setTechniciens] = useState([])
  const [loading, setLoading] = useState(true)

  // --- États pour la création ---
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [newIntervention, setNewIntervention] = useState({
    titre: '',
    description: '',
    type: 'curative',
    statut: 'ouverte',
    priorite: 'normale',
    equipement_id: '',
    technicien_id: '',
    date_intervention: '',
  })

  // --- États pour l'édition ---
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingIntervention, setEditingIntervention] = useState(null)
  const [editData, setEditData] = useState(null)

  // --- États pour la suppression ---
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deletingName, setDeletingName] = useState('')

  // Chargement des interventions
  const loadInterventions = () => {
    setLoading(true)
    api
      .get('/interventions')
      .then((res) => setInterventions(res.data.data ?? res.data))
      .catch((err) => console.error('Erreur chargement interventions :', err))
      .finally(() => setLoading(false))
  }

  // Chargement des équipements et techniciens
  const loadReferences = () => {
    // Récupérer les équipements
    api
      .get('/equipements')
      .then((res) => setEquipements(res.data.data ?? res.data))
      .catch((err) => console.error('Erreur chargement équipements :', err))

    // Récupérer les techniciens (utilisateurs avec rôle 'technicien')
    api
      .get('/users', { params: { role: 'technicien' } })
      .then((res) => setTechniciens(res.data.data ?? res.data))
      .catch((err) => console.error('Erreur chargement techniciens :', err))
  }

  useEffect(() => {
    loadInterventions()
    loadReferences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Création ---
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await api.post('/interventions', newIntervention)
      setShowCreateModal(false)
      setNewIntervention({
        titre: '',
        description: '',
        type: 'curative',
        statut: 'ouverte',
        priorite: 'normale',
        equipement_id: '',
        technicien_id: '',
        date_intervention: '',
      })
      loadInterventions()
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
  const openEditModal = (intervention) => {
    setEditingIntervention(intervention)
    setEditData({
      titre: intervention.titre,
      description: intervention.description || '',
      type: intervention.type,
      statut: intervention.statut,
      priorite: intervention.priorite,
      equipement_id: intervention.equipement_id,
      technicien_id: intervention.technicien_id || '',
      date_intervention: intervention.date_intervention ? intervention.date_intervention.slice(0, 16) : '',
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await api.put(`/interventions/${editingIntervention.id}`, editData)
      setShowEditModal(false)
      setEditingIntervention(null)
      setEditData(null)
      loadInterventions()
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
  const openDeleteModal = (id, titre) => {
    setDeletingId(id)
    setDeletingName(titre)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await api.delete(`/interventions/${deletingId}`)
      setShowDeleteModal(false)
      setDeletingId(null)
      setDeletingName('')
      loadInterventions()
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
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Interventions</h1>
          <p className="text-slate-500">Suivez les tickets de maintenance et incidents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Nouvelle intervention
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-6 py-3 font-semibold">Titre</th>
              <th className="text-left px-6 py-3 font-semibold">Équipement</th>
              <th className="text-left px-6 py-3 font-semibold">Statut</th>
              <th className="text-left px-6 py-3 font-semibold">Priorité</th>
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
            {!loading && interventions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Aucune intervention trouvée.
                </td>
              </tr>
            )}
            {interventions.map((i) => (
              <tr key={i.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                  <Wrench size={16} className="text-slate-400" /> {i.titre}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {i.equipement?.type} {i.equipement?.marque ? `(${i.equipement.marque})` : ''}
                  {i.equipement?.magasin?.nom && ` - ${i.equipement.magasin.nom}`}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUT_STYLES[i.statut]}`}>
                    {i.statut}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITE_STYLES[i.priorite]}`}>
                    {i.priorite}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(i)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(i.id, i.titre)}
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
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Nouvelle intervention</h2>
            <p className="text-slate-500 text-sm mb-4">Remplissez les informations ci-dessous.</p>
            {formError && (
              <div className="bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2 mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={newIntervention.titre}
                    onChange={(e) => setNewIntervention({ ...newIntervention, titre: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newIntervention.description}
                    onChange={(e) => setNewIntervention({ ...newIntervention, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Équipement *</label>
                  <select
                    value={newIntervention.equipement_id}
                    onChange={(e) => setNewIntervention({ ...newIntervention, equipement_id: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez un équipement</option>
                    {equipements.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.type} {eq.marque ? `(${eq.marque})` : ''} - {eq.magasin?.nom || 'Sans magasin'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Technicien</label>
                  <select
                    value={newIntervention.technicien_id}
                    onChange={(e) => setNewIntervention({ ...newIntervention, technicien_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun</option>
                    {techniciens.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select
                      value={newIntervention.type}
                      onChange={(e) => setNewIntervention({ ...newIntervention, type: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
                    <select
                      value={newIntervention.priorite}
                      onChange={(e) => setNewIntervention({ ...newIntervention, priorite: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PRIORITE_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    value={newIntervention.statut}
                    onChange={(e) => setNewIntervention({ ...newIntervention, statut: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUT_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date prévue</label>
                  <input
                    type="datetime-local"
                    value={newIntervention.date_intervention}
                    onChange={(e) => setNewIntervention({ ...newIntervention, date_intervention: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Modifier l'intervention</h2>
            <p className="text-slate-500 text-sm mb-4">Mettez à jour les informations.</p>
            {formError && (
              <div className="bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2 mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={editData.titre}
                    onChange={(e) => setEditData({ ...editData, titre: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Équipement *</label>
                  <select
                    value={editData.equipement_id}
                    onChange={(e) => setEditData({ ...editData, equipement_id: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez un équipement</option>
                    {equipements.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.type} {eq.marque ? `(${eq.marque})` : ''} - {eq.magasin?.nom || 'Sans magasin'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Technicien</label>
                  <select
                    value={editData.technicien_id}
                    onChange={(e) => setEditData({ ...editData, technicien_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun</option>
                    {techniciens.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select
                      value={editData.type}
                      onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
                    <select
                      value={editData.priorite}
                      onChange={(e) => setEditData({ ...editData, priorite: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PRIORITE_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    value={editData.statut}
                    onChange={(e) => setEditData({ ...editData, statut: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUT_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date prévue</label>
                  <input
                    type="datetime-local"
                    value={editData.date_intervention}
                    onChange={(e) => setEditData({ ...editData, date_intervention: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
              Êtes-vous sûr de vouloir supprimer l'intervention <strong>{deletingName}</strong> ? Cette action est irréversible.
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