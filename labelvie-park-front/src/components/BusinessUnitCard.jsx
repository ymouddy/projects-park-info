import { Briefcase } from 'lucide-react'

// Palette pastel de fond + couleur d'icône par unité, pour matcher la capture d'écran
const PALETTES = {
  '#3B82F6': { bg: 'bg-blue-50', icon: 'bg-blue-600' },
  '#EF4444': { bg: 'bg-rose-50', icon: 'bg-rose-500' },
  '#84CC16': { bg: 'bg-lime-50', icon: 'bg-lime-500' },
  '#10B981': { bg: 'bg-emerald-50', icon: 'bg-emerald-600' },
  '#14B8A6': { bg: 'bg-teal-50', icon: 'bg-teal-600' },
  '#F97316': { bg: 'bg-orange-50', icon: 'bg-orange-500' },
}

export default function BusinessUnitCard({ unit, onClick, active }) {
  const palette = PALETTES[unit.couleur] || { bg: 'bg-slate-50', icon: 'bg-slate-500' }

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl p-5 border transition-all ${palette.bg} ${
        active ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-transparent hover:border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${palette.icon}`}>
          <Briefcase size={18} className="text-white" />
        </div>
        <span className="text-xs font-bold text-slate-500 tracking-wide">{unit.code}</span>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{unit.magasins}</div>
      <div className="text-xs font-semibold text-slate-500 uppercase mb-4">Magasins</div>
      <div className="text-sm text-slate-600 flex justify-between">
        <span>Caisses:</span>
        <span className="font-bold text-slate-900">{unit.caisses}</span>
      </div>
      <div className="text-sm text-slate-600 flex justify-between">
        <span>Balances:</span>
        <span className="font-bold text-slate-900">{unit.balances}</span>
      </div>
    </button>
  )
}
