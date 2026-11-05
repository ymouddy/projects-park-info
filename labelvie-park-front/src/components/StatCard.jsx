export default function StatCard({ icon: Icon, iconBg, badge, badgeColor, value, label, trend, trendColor, barColor, barPercent = 60 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={22} className="text-white" />
        </div>
        <div className="text-right">
          <span className={`text-xs font-semibold tracking-wide ${badgeColor}`}>{badge}</span>
          <div className="text-3xl font-bold text-slate-900">{value}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 text-sm font-medium">{label}</span>
        <span className={`text-xs font-semibold ${trendColor}`}>{trend}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barPercent}%` }} />
      </div>
    </div>
  )
}
