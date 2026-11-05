import { NavLink } from 'react-router-dom'
import { LayoutGrid, Briefcase, Store, Laptop, Wrench, Users } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/business-units', label: 'Unités Business', icon: Briefcase },
  { to: '/magasins', label: 'Magasins', icon: Store },
  { to: '/equipements', label: 'Équipements', icon: Laptop },
  { to: '/interventions', label: 'Interventions', icon: Wrench },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: Users },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#0f1729] text-slate-300 flex-shrink-0 py-6 px-4">
      <div className="px-2 mb-8">
        <h1 className="text-white font-bold text-lg">LabelVie</h1>
        <p className="text-xs text-slate-500">Park Manager</p>
      </div>
      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}