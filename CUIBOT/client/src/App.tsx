import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Alimentacion from '@/pages/Alimentacion';
import Actividad from '@/pages/Actividad';
import Medicamentos from '@/pages/Medicamentos';
import Cuibot from '@/pages/Cuibot';
import Perfil from '@/pages/Perfil';

function RutaProtegida({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: `${ubicacion.pathname}${ubicacion.search}` }} />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RutaProtegida>
            <AppLayout />
          </RutaProtegida>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/alimentacion" element={<Alimentacion />} />
        <Route path="/actividad" element={<Actividad />} />
        <Route path="/medicamentos" element={<Medicamentos />} />
        <Route path="/cuibot" element={<Cuibot />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
