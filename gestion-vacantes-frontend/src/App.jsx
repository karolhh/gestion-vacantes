import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './components/Index';
import Login from './components/Login';
import Register from './components/Register'; // <-- IMPORTAR EL NUEVO COMPONENTE

import AdminDashboard from './components/admin/AdminDashboard';
import ReclutadorForm from './components/admin/ReclutadorForm';
import ReclutadorDashboard from './components/reclutador/ReclutadorDashboard';
import PostulanteDashboard from './components/postulante/PostulanteDashboard';

const RutaProtegida = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(rol)) return <Navigate to="/login" />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* <-- NUEVA RUTA */}

        <Route path="/admin" element={<RutaProtegida allowedRoles={['ADMIN']}><AdminDashboard /></RutaProtegida>} />
        <Route path="/admin/crear" element={<RutaProtegida allowedRoles={['ADMIN']}><ReclutadorForm /></RutaProtegida>} />
        <Route path="/admin/editar/:id" element={<RutaProtegida allowedRoles={['ADMIN']}><ReclutadorForm /></RutaProtegida>} />

        <Route path="/reclutador" element={<RutaProtegida allowedRoles={['RECLUTADOR']}><ReclutadorDashboard /></RutaProtegida>} />

        <Route path="/postulante" element={<RutaProtegida allowedRoles={['POSTULANTE']}><PostulanteDashboard /></RutaProtegida>} />
      </Routes>
    </Router>
  );
}

export default App;