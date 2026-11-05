import Sidebar from '../components/Sidebar.jsx'

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">{children}</main>
    </div>
  )
}
