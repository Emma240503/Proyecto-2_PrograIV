import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router';
import logo from './assets/logo.png';
import './App.css';
import './css/Common.css';
import Puestos from './Puestos.jsx';
import Buscar from './pages/Buscar.jsx';
import RegistroEmpresa from './pages/RegistroEmpresa.jsx';
import RegistroOferente from './pages/RegistroOferente.jsx';
import DashboardEmpresa from './pages/DashboardEmpresa.jsx';
import DashboardOferente from './pages/DashboardOferente.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import LoginModal from './components/LoginModal.jsx';

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      token,
      rol:    localStorage.getItem('rol'),
      id:     localStorage.getItem('id'),
      nombre: localStorage.getItem('nombre'),
    };
  });
  const [showLogin, setShowLogin] = useState(false);

  function handleLogin(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('rol',    data.rol);
    localStorage.setItem('id',     String(data.id));
    localStorage.setItem('nombre', data.nombre);
    setUser(data);
    setShowLogin(false);
  }

  function handleLogout() {
    ['token', 'rol', 'id', 'nombre'].forEach(k => localStorage.removeItem(k));
    setUser(null);
  }

  return (
    <BrowserRouter>
      <Header user={user} onLoginClick={() => setShowLogin(true)} onLogout={handleLogout} />
      <Main user={user} />
      <Footer />
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />
      )}
    </BrowserRouter>
  );
}

function Header({ user, onLoginClick, onLogout }) {
  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} className="logo" alt="logo" />
        <Link to="/" className="header-title-link">
          <span className="header-title">BolsaEmpleo</span>
        </Link>
      </div>
      <nav className="header-nav">
        <Link to="/buscar">Buscar puestos</Link>
        <Link to="/registro/empresa">Registrar empresa</Link>
        <Link to="/registro/oferente">Registrar oferente</Link>
      </nav>
      {user ? (
        <div className="user-info">
          <span className="user-name">{user.nombre}</span>
          <button className="login-btn" onClick={onLogout}>Cerrar sesión</button>
        </div>
      ) : (
        <button className="login-btn" onClick={onLoginClick}>Login</button>
      )}
    </header>
  );
}

function ProtectedRoute({ user, role, children }) {
  if (!user) return <Navigate to="/" replace />;
  if (role && user.rol !== role) return <Navigate to="/" replace />;
  return children;
}

function Main({ user }) {
  return (
    <div className="main">
      <Routes>
        <Route path="/"                   element={<Puestos />} />
        <Route path="/puestos"            element={<Puestos />} />
        <Route path="/buscar"             element={<Buscar />} />
        <Route path="/registro/empresa"   element={<RegistroEmpresa />} />
        <Route path="/registro/oferente"  element={<RegistroOferente />} />
        <Route
          path="/dashboard/empresa"
          element={
            <ProtectedRoute user={user} role="EMPRESA">
              <DashboardEmpresa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/oferente"
          element={
            <ProtectedRoute user={user} role="OFERENTE">
              <DashboardOferente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute user={user} role="ADMIN">
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>Bolsa de Empleo</strong><br />
        <small>Total Soft Inc.</small>
      </div>
      <div>
        <small>Contacto: info@bolsaempleo.local</small><br />
        <small>Créditos: Equipo de desarrollo</small>
      </div>
    </footer>
  );
}

export default App;
