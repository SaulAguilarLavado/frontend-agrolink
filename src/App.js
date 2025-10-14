import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/login.jsx';
import Register from './components/Register.jsx';
import Dashboard from './components/Dashboard.jsx';
import CreateProduct from './components/CreateProduct.jsx'; // <-- IMPORTAR
import RegisterCrop from './components/RegisterCrop.jsx'; // <-- IMPORTAR
import Marketplace from './components/Marketplace.jsx'; 
import { Navigate } from 'react-router-dom';
import authService from './services/authService';
import './App.css';


const Home = () => {
  const [search, setSearch] = React.useState('');
  const [stats, setStats] = React.useState({ products: 0, farmers: 0, orders: 0 });
  const [subscribed, setSubscribed] = React.useState(false);
  const [testimonialIndex, setTestimonialIndex] = React.useState(0);

  const features = [
    { id: 1, icon: '🌱', title: 'Publica tus productos', text: 'Sube tus cosechas y alcanza compradores locales con facilidad.' },
    { id: 2, icon: '🤝', title: 'Conecta y negocia', text: 'Comunícate directamente con compradores y gestiona acuerdos.' },
    { id: 3, icon: '📈', title: 'Analiza tu producción', text: 'Paneles sencillos para monitorear tus rendimientos y ventas.' },
    { id: 4, icon: '🚚', title: 'Logística', text: 'Conecta con opciones de entrega y transporte local.' },
    { id: 5, icon: '💬', title: 'Mensajería', text: 'Comunícate en tiempo real con compradores y vendedores.' },
  ];

  const testimonials = [
    { name: 'María P.', text: 'Agrolink me permitió encontrar compradores locales en menos de una semana.' },
    { name: 'Carlos G.', text: 'Publicar mis productos fue muy sencillo y eficiente.' },
    { name: 'Lucía R.', text: 'Excelente plataforma para gestionar mis cosechas.' },
  ];

  // Animated counters (simulación)
  React.useEffect(() => {
    const targets = { products: 124, farmers: 32, orders: 540 };
    const duration = 900; // ms
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      setStats({
        products: Math.floor(progress * targets.products),
        farmers: Math.floor(progress * targets.farmers),
        orders: Math.floor(progress * targets.orders),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, []);

  // Rotate testimonials
  React.useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const filtered = features.filter(f => f.title.toLowerCase().includes(search.toLowerCase()) || f.text.toLowerCase().includes(search.toLowerCase()));

  return (
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

              <div className="mt-4">
                <div className="d-flex gap-3 stats">
                  <div className="stat">
                    <div className="stat-value">{stats.products}</div>
                    <div className="stat-label text-muted small">Productos</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{stats.farmers}</div>
                    <div className="stat-label text-muted small">Agricultores</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{stats.orders}</div>
                    <div className="stat-label text-muted small">Pedidos</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-none d-md-block">
              <div className="hero-illustration p-4">
                <svg width="100%" height="320" viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agriculture illustration">
                  <rect width="100%" height="100%" rx="12" fill="#f8f9fa" />
                  <g transform="translate(40,40)" fill="#0d6efd">
                    <circle cx="60" cy="80" r="30" opacity="0.12" />
                    <rect x="140" y="40" width="160" height="140" rx="12" opacity="0.06" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features py-5 bg-white">
        <div className="container">
          <div className="row align-items-center mb-3">
            <div className="col-md-8">
              <h2 className="fw-bold">Lo que ofrecemos</h2>
              <p className="text-muted">Herramientas pensadas para facilitar el comercio y la gestión agrícola.</p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <input className="form-control" placeholder="Buscar funciones..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="row g-4">
            {filtered.map(f => (
              <div key={f.id} className="col-md-4">
                <div className="card h-100 shadow-sm feature-card">
                  <div className="card-body text-center">
                    <div className="feature-icon mb-3" style={{fontSize: '28px'}}>{f.icon}</div>
                    <h5 className="card-title">{f.title}</h5>
                    <p className="card-text text-muted">{f.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-5 align-items-center">
            <div className="col-md-6">
              <h4>Testimonios</h4>
              <div className="testimonial card p-3 shadow-sm">
                <p className="mb-1">"{testimonials[testimonialIndex].text}"</p>
                <div className="small text-muted">— {testimonials[testimonialIndex].name}</div>
              </div>
            </div>
            <div className="col-md-6">
              <h4>Suscríbete a novedades</h4>
              {!subscribed ? (
                <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} className="d-flex gap-2">
                  <input type="email" className="form-control" required placeholder="tu@correo.com" />
                  <button className="btn btn-primary">Suscribir</button>
                </form>
              ) : (
                <div className="alert alert-success">Gracias por suscribirte. Te avisaremos novedades.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};


function App() {
  const [currentUser, setCurrentUser] = React.useState(authService.getCurrentUser());

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    // No necesitas redirigir aquí, el router lo hará
  };
  return (
    <Router>
      <header>
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
          <div className="container">
            <Link className="navbar-brand fw-bold" to={currentUser ? '/dashboard' : '/'}>AgroLink</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navMenu">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                {currentUser ? (
                  // Si el usuario está logueado
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                    <li className="nav-item"><a className="nav-link" href="/login" onClick={handleLogout}>Logout</a></li>
                  </>
                ) : (
                  // Si el usuario NO está logueado
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/register">Registro</Link></li>
                  </>
                )}
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
          <Route  path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />
          <Route   path="/create-product" element={currentUser ? <CreateProduct /> : <Navigate to="/login" />} />
          <Route path="/register-crop"element={currentUser ? <RegisterCrop /> : <Navigate to="/login" />} />
          <Route path="/marketplace" element={currentUser ? <Marketplace /> : <Navigate to="/login" />} />
        </Routes>
      </div>

      <footer className="py-4 bg-light mt-5">
        <div className="container text-center small text-muted">© {new Date().getFullYear()} AgroLink — Conectando el campo</div>
      </footer>
    </Router>
  );
}

export default App;