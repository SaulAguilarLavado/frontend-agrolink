import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/login.jsx';
import Register from './components/Register.jsx';
import './App.css';

const Home = () => (
  <main>
    <section className="hero py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h1 className="display-5 fw-bold">Bienvenido a AgroLink</h1>
            <p className="lead text-muted">Conecta con agricultores y compradores, gestiona cultivos y encuentra los mejores productos locales.</p>
            <div className="d-flex gap-2 mt-4">
              <Link to="/register" className="btn btn-lg btn-primary">Comenzar</Link>
              <Link to="/login" className="btn btn-lg btn-outline-secondary">Ingresar</Link>
            </div>
          </div>
          <div className="col-md-6 d-none d-md-block">
            <div className="hero-illustration p-4">
              {/* Simple SVG/illustration placeholder */}
              <svg width="100%" height="260" viewBox="0 0 600 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agriculture illustration">
                <rect width="100%" height="100%" rx="12" fill="#f8f9fa" />
                <g transform="translate(40,40)" fill="#0d6efd">
                  <circle cx="60" cy="80" r="30" opacity="0.15" />
                  <rect x="140" y="40" width="140" height="120" rx="12" opacity="0.08" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="features py-5 bg-white">
      <div className="container">
        <div className="row text-center mb-4">
          <div className="col-lg-8 mx-auto">
            <h2 className="fw-bold">Lo que ofrecemos</h2>
            <p className="text-muted">Herramientas pensadas para facilitar el comercio y la gestión agrícola.</p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm feature-card">
              <div className="card-body text-center">
                <div className="feature-icon mb-3">🌱</div>
                <h5 className="card-title">Publica tus productos</h5>
                <p className="card-text text-muted">Sube tus cosechas y alcanza compradores locales con facilidad.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm feature-card">
              <div className="card-body text-center">
                <div className="feature-icon mb-3">🤝</div>
                <h5 className="card-title">Conecta y negocia</h5>
                <p className="card-text text-muted">Comunícate directamente con compradores y gestiona acuerdos.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm feature-card">
              <div className="card-body text-center">
                <div className="feature-icon mb-3">📈</div>
                <h5 className="card-title">Analiza tu producción</h5>
                <p className="card-text text-muted">Paneles sencillos para monitorear tus rendimientos y ventas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
);

const Dashboard = () => <h2>Este es tu Dashboard</h2>;

function App() {
  return (
    <Router>
      <header>
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/">AgroLink</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navMenu">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Registro</Link></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>

      <footer className="py-4 bg-light mt-5">
        <div className="container text-center small text-muted">© {new Date().getFullYear()} AgroLink — Conectando el campo</div>
      </footer>
    </Router>
  );
}

export default App;