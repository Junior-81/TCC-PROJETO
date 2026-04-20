// ============================================================================
// TCC: Componente Principal da Aplicação
// Propósito: Definir navegação e estrutura geral do Frontend
// ============================================================================

import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Faturamento from './pages/Faturamento';
import PacientePage from './pages/Paciente';
import Login from './pages/Login';
import './App.css';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-header">
          <h1> Clínica Médica - Plataforma Governada</h1>
          <p className="subtitle">
            TCC: Engenharia de Plataforma para Sistemas Médicos Legados
          </p>
        </header>

        <nav className="app-nav">
          <Link to="/" className="nav-link">
             Faturamento
          </Link>
          <Link to="/paciente" className="nav-link">
             Paciente
          </Link>
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Faturamento /></PrivateRoute>} />
            <Route path="/paciente" element={<PrivateRoute><PacientePage /></PrivateRoute>} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>
            Powered by: Node.js + Express + PostgreSQL + React + TypeScript
          </p>
          <p>
             Governança: OpenAPI 3.0 + Spectral Policy-as-Code
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
