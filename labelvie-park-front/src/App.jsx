import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Magasins from './pages/Magasins.jsx'
import Equipements from './pages/Equipements.jsx'
import Interventions from './pages/Interventions.jsx'
import Utilisateurs from './pages/Utilisateurs.jsx'
import BusinessUnits from './pages/BusinessUnits.jsx'   // <-- import ajouté
import Login from './pages/Login.jsx'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/business-units" element={<PrivateRoute><BusinessUnits /></PrivateRoute>} />
        <Route path="/magasins" element={<PrivateRoute><Magasins /></PrivateRoute>} />
        <Route path="/equipements" element={<PrivateRoute><Equipements /></PrivateRoute>} />
        <Route path="/interventions" element={<PrivateRoute><Interventions /></PrivateRoute>} />
        <Route path="/utilisateurs" element={<PrivateRoute><Utilisateurs /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}