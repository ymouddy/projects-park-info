import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'

export default function Login() {
  const [email, setEmail] = useState('admin@labelvie.ma')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/login', { email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">LabelVie Park Manager</h1>
        <p className="text-slate-500 text-sm mb-6">Connectez-vous à votre compte</p>

        {error && <div className="bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}

        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
          Se connecter
        </button>
      </form>
    </div>
  )
}
