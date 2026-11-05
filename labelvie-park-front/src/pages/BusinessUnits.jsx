import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Store,
  Search,
  Briefcase,
  Wallet,
  Scale,
  AlertTriangle,
  Building2,
  ShoppingCart,
  Gauge,
} from 'lucide-react'
import api from '../services/api.js'
import MainLayout from '../layouts/MainLayout.jsx'
import BusinessUnitCard from '../components/BusinessUnitCard'

// Icônes disponibles pour représenter un pôle métier.
// Une liste fermée plutôt qu'un champ texte libre : plus fiable, plus rapide à choisir.
const ICON_OPTIONS = [
  { value: 'store', label: 'Magasin', Icon: Store },
  { value: 'briefcase', label: 'Métier', Icon: Briefcase },
  { value: 'wallet', label: 'Finance', Icon: Wallet },
  { value: 'scale', label: 'Juridique', Icon: Scale },
]

const ICON_MAP = Object.fromEntries(ICON_OPTIONS.map((o) => [o.value, o.Icon]))

// Palette resserrée : couleurs choisies pour rester lisibles en accent de carte,
// plus une option "personnalisée" via le color picker natif.
const COLOR_PRESETS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#E11D48', '#8B5CF6']

export default function BusinessUnits() {
  const [businessUnits, setBusinessUnits] = useState([])
  const [magasins, setMagasins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // États pour les modals CRUD
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    couleur: '#4F46E5',
    icone: 'store',
  })

  // Suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deletingName, setDeletingName] = useState('')

  // Modal liste des magasins
  const [showMagasinsModal, setShowMagasinsModal] = useState(false)
  const [selectedBU, setSelectedBU] = useState(null)

  // Récupération des données
  const loadData = () => {
    setLoading(true)
    Promise.all([api.get('/business-units'), api.get('/magasins')])
      .then(([resBU, resMag]) => {
        const buData = resBU.data.data ?? resBU.data
        const magData = resMag.data.data ?? resMag.data
        setBusinessUnits(buData)
        setMagasins(magData)
      })
      .catch((err) => console.error('Erreur chargement :', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtrage des unités
  const filteredUnits = businessUnits.filter(
    (bu) =>
      bu.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bu.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Statistiques par unité
  const getStatsForBU = (buId) => {
    const mags = magasins.filter((m) => m.business_unit_id === buId)
    const caisses = mags.reduce((sum, m) => sum + (m.nombre_caisses || 0), 0)
    const balances = mags.reduce((sum, m) => sum + (m.nombre_balances || 0), 0)
    return { magasins: mags.length, caisses, balances }
  }

  // Statistiques globales (bandeau d'en-tête)
  const globalStats = useMemo(() => {
    const totalCaisses = magasins.reduce((sum, m) => sum + (m.nombre_caisses || 0), 0)
    const totalBalances = magasins.reduce((sum, m) => sum + (m.nombre_balances || 0), 0)
    return {
      unites: businessUnits.length,
      magasins: magasins.length,
      caisses: totalCaisses,
      balances: totalBalances,
    }
  }, [businessUnits, magasins])

  // CRUD : création, édition, suppression
  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ nom: '', code: '', couleur: '#4F46E5', icone: 'store' })
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (bu) => {
    setEditingId(bu.id)
    setFormData({
      nom: bu.nom,
      code: bu.code,
      couleur: bu.couleur || '#4F46E5',
      icone: bu.icone || 'store',
    })
    setFormError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      if (editingId) {
        await api.put(`/business-units/${editingId}`, formData)
      } else {
        await api.post('/business-units', formData)
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const messages = Object.values(errors).flat()
        setFormError(messages.join(' '))
      } else {
        setFormError(err.response?.data?.message || 'Erreur lors de l’enregistrement.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const openDeleteModal = (id, nom) => {
    setDeletingId(id)
    setDeletingName(nom)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await api.delete(`/business-units/${deletingId}`)
      setShowDeleteModal(false)
      loadData()
    } catch (err) {
      alert('Erreur lors de la suppression.')
    } finally {
      setSubmitting(false)
    }
  }

  const openMagasinsModal = (bu) => {
    setSelectedBU(bu)
    setShowMagasinsModal(true)
  }

  return (
    <MainLayout>
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200 shrink-0">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Unités Business
            </h1>
            <p className="text-slate-500 text-sm">Gérez vos pôles et leurs magasins associés</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm shadow-indigo-200"
        >
          <Plus size={18} /> Nouvelle unité
        </button>
      </div>

      {/* Bandeau de statistiques globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Briefcase} label="Unités" value={globalStats.unites} accent="text-indigo-600 bg-indigo-50" />
        <StatCard icon={Store} label="Magasins" value={globalStats.magasins} accent="text-sky-600 bg-sky-50" />
        <StatCard icon={ShoppingCart} label="Caisses" value={globalStats.caisses} accent="text-emerald-600 bg-emerald-50" />
        <StatCard icon={Gauge} label="Balances" value={globalStats.balances} accent="text-amber-600 bg-amber-50" />
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-md mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par nom ou code..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
        />
      </div>

      {/* Grille des cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center text-slate-400 py-16 gap-2">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-sm">Chargement...</span>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-16 gap-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
              <Building2 size={22} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Aucune unité business trouvée</p>
            <p className="text-slate-400 text-sm">Essayez un autre terme, ou créez une nouvelle unité.</p>
          </div>
        ) : (
          filteredUnits.map((bu) => {
            const stats = getStatsForBU(bu.id)
            const unitWithStats = { ...bu, ...stats }
            return (
              <div
                key={bu.id}
                className="relative group rounded-2xl transition-transform duration-200 hover:-translate-y-0.5"
                style={{ boxShadow: `0 0 0 1px transparent` }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: bu.couleur || '#4F46E5' }}
                />
                <BusinessUnitCard unit={unitWithStats} onClick={() => openMagasinsModal(bu)} />
                <div className="absolute top-3 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(bu)
                    }}
                    className="p-1.5 bg-white rounded-lg shadow-md border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openDeleteModal(bu.id, bu.nom)
                    }}
                    className="p-1.5 bg-white rounded-lg shadow-md border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-rose-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal Création / Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
              {editingId ? 'Modifier' : 'Nouvelle'} unité
            </h2>
            <p className="text-slate-500 text-sm mb-5">
              {editingId ? 'Mettez à jour' : 'Remplissez'} les informations ci-dessous.
            </p>
            {formError && (
              <div className="flex items-start gap-2 bg-rose-50 text-rose-700 text-sm rounded-xl px-3 py-2.5 mb-4">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                    placeholder="ex : Épicerie fine"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="ex : EPF"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>

                {/* Sélecteur de couleur */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Couleur</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setFormData({ ...formData, couleur: c })}
                        className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c,
                          boxShadow: formData.couleur === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                        }}
                        aria-label={`Choisir la couleur ${c}`}
                      />
                    ))}
                    <label className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden relative hover:border-indigo-400 transition-colors">
                      <span
                        className="w-full h-full block"
                        style={{
                          background: COLOR_PRESETS.includes(formData.couleur)
                            ? 'conic-gradient(from 0deg, #f43f5e, #f59e0b, #10b981, #0ea5e9, #8b5cf6, #f43f5e)'
                            : formData.couleur,
                        }}
                      />
                      <input
                        type="color"
                        value={formData.couleur}
                        onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Sélecteur d'icône */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Icône</label>
                  <div className="grid grid-cols-4 gap-2">
                    {ICON_OPTIONS.map(({ value, label, Icon }) => {
                      const active = formData.icone === value
                      return (
                        <button
                          type="button"
                          key={value}
                          onClick={() => setFormData({ ...formData, icone: value })}
                          className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-colors ${
                            active
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-[11px] font-medium">{label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mb-3">
              <AlertTriangle size={20} className="text-rose-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">Confirmer la suppression</h2>
            <p className="text-slate-500 text-sm mb-5">
              Êtes-vous sûr de vouloir supprimer l'unité <strong className="text-slate-700">{deletingName}</strong> ?
              Cette action est irréversible.
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
                className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Liste des magasins */}
      {showMagasinsModal && selectedBU && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setShowMagasinsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${selectedBU.couleur || '#4F46E5'}1A` }}
              >
                {(() => {
                  const Icon = ICON_MAP[selectedBU.icone] || Store
                  return <Icon size={18} style={{ color: selectedBU.couleur || '#4F46E5' }} />
                })()}
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{selectedBU.nom}</h2>
            </div>
            <p className="text-slate-500 text-sm mb-4 ml-12 -mt-1">
              {magasins.filter((m) => m.business_unit_id === selectedBU.id).length} magasin(s)
            </p>
            {magasins.filter((m) => m.business_unit_id === selectedBU.id).length === 0 ? (
              <p className="text-slate-400 text-sm py-6 text-center">Aucun magasin associé.</p>
            ) : (
              <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto -mx-2">
                {magasins
                  .filter((m) => m.business_unit_id === selectedBU.id)
                  .map((m) => (
                    <li key={m.id} className="py-2.5 px-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Store size={14} className="text-slate-500" />
                      </div>
                      <span className="text-slate-700 font-medium flex-1 truncate">{m.nom}</span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {m.code}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-900 leading-tight tabular-nums">{value}</p>
        <p className="text-xs text-slate-500 truncate">{label}</p>
      </div>
    </div>
  )
}