import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Destinations from './pages/Destinations';
import Contact from './pages/Contact';
import Profile from './pages/Profile';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Nearby from './pages/Nearby';

// Componente para proteger las rutas de administrador
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente para proteger las rutas de usuarios regulares (requieren estar registrados)
const UserRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();

  // Desplazar la vista hacia arriba cada vez que cambia la ruta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="nearby" element={<UserRoute><Nearby /></UserRoute>} />
            <Route path="destination/:id" element={<Destinations />} />
            <Route path="contact" element={<Contact />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}

export default App;
