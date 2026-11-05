import { useEffect, useState } from 'react'
import { Store, Laptop, CheckCircle2, AlertTriangle } from 'lucide-react'
import api from '../services/api.js'
import StatCard from '../components/StatCard.jsx'
import BusinessUnitCard from '../components/BusinessUnitCard.jsx'
import MainLayout from '../layouts/MainLayout.jsx'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [activeUnit, setActiveUnit] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-8">
        Vue d'ensemble de votre parc informatique et de vos points de vente
      </p>

      {loading && <p className="text-slate-400">Chargement...</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
            <StatCard
              icon={Store}
              iconBg="bg-blue-600"
              badge="TOTAL"
              badgeColor="text-slate-400"
              value={data.stats.magasins.total}
              label="Magasins"
              trend="↑ +12%"
              trendColor="text-blue-600"
              barColor="bg-blue-600"
              barPercent={45}
            />
            <StatCard
              icon={Laptop}
              iconBg="bg-emerald-500"
              badge="TOTAL"
              badgeColor="text-slate-400"
              value={data.stats.equipements.total}
              label="Équipements"
              trend="↑ +8%"
              trendColor="text-emerald-600"
              barColor="bg-emerald-500"
              barPercent={60}
            />
            <StatCard
              icon={CheckCircle2}
              iconBg="bg-emerald-500"
              badge="ACTIFS"
              badgeColor="text-slate-400"
              value={data.stats.operationnels.total}
              label="Opérationnels"
              trend="— Stable"
              trendColor="text-slate-400"
              barColor="bg-emerald-500"
              barPercent={75}
            />
            <StatCard
              icon={AlertTriangle}
              iconBg="bg-rose-500"
              badge="EN PANNE"
              badgeColor="text-rose-300"
              value={data.stats.incidents.total}
              label="Incidents"
              trend="↑ Critique"
              trendColor="text-rose-500"
              barColor="bg-rose-500"
              barPercent={20}
            />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Totaux par Business Unit</h2>
          <p className="text-slate-500 mb-6">
            Cliquez sur une unité pour voir et filtrer ses magasins associés
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {data.business_units.map((unit) => (
              <BusinessUnitCard
                key={unit.id}
                unit={unit}
                active={activeUnit === unit.id}
                onClick={() => setActiveUnit(unit.id === activeUnit ? null : unit.id)}
              />
            ))}
          </div>
        </>
      )}
    </MainLayout>
  )
}
