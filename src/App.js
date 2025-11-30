import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/login.jsx';
import Register from './components/Register.jsx';
import Dashboard from './components/Dashboard.jsx';
import CreateProduct from './components/CreateProduct.jsx'; // <-- IMPORTAR
import RegisterCrop from './components/RegisterCrop.jsx'; // <-- IMPORTAR
import Marketplace from './components/Marketplace.jsx'; 
import Inventory from './components/Inventory.jsx';
import CropDetail from './components/CropDetail.jsx';
import RegisterHarvest from './components/RegisterHarvest.jsx';
import MyHarvests from './components/MyHarvests.jsx';
import MyCrops from './components/MyCrops.jsx';
import { Navigate } from 'react-router-dom';
import authService from './services/authService';
import './App.css';
import { AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, TextField, Box } from '@mui/material';


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
      <section>
        <Container sx={{ py: 5 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom>Bienvenido a AgroLink</Typography>
              <Typography variant="body1" color="text.secondary">Conecta con agricultores y compradores, gestiona cultivos y encuentra los mejores productos locales.</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button component={Link} to="/register" variant="contained">Comenzar</Button>
                <Button component={Link} to="/login" variant="outlined">Ingresar</Button>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', gap: 3 }}>
                <Box>
                  <Typography variant="h5">{stats.products}</Typography>
                  <Typography variant="caption" color="text.secondary">Productos</Typography>
                </Box>
                <Box>
                  <Typography variant="h5">{stats.farmers}</Typography>
                  <Typography variant="caption" color="text.secondary">Agricultores</Typography>
                </Box>
                <Box>
                  <Typography variant="h5">{stats.orders}</Typography>
                  <Typography variant="caption" color="text.secondary">Pedidos</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ p: 2 }}>
                <svg width="100%" height="320" viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agriculture illustration">
                  <rect width="100%" height="100%" rx="12" fill="#f8f9fa" />
                  <g transform="translate(40,40)" fill="#0d6efd">
                    <circle cx="60" cy="80" r="30" opacity="0.12" />
                    <rect x="140" y="40" width="160" height="140" rx="12" opacity="0.06" />
                  </g>
                </svg>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </section>

      <section>
        <Container sx={{ py: 5 }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>Lo que ofrecemos</Typography>
              <Typography variant="body2" color="text.secondary">Herramientas pensadas para facilitar el comercio y la gestión agrícola.</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth placeholder="Buscar funciones..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </Grid>

            {filtered.map(f => (
              <Grid item xs={12} md={4} key={f.id}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: 28, mb: 1 }}>{f.icon}</Box>
                    <Typography variant="h6">{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12} md={6}>
              <Typography variant="h6">Testimonios</Typography>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography>"{testimonials[testimonialIndex].text}"</Typography>
                  <Typography variant="caption" color="text.secondary">— {testimonials[testimonialIndex].name}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6">Suscríbete a novedades</Typography>
              {!subscribed ? (
                <Box component="form" onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} sx={{ display: 'flex', gap: 2 }}>
                  <TextField type="email" required placeholder="tu@correo.com" fullWidth />
                  <Button variant="contained">Suscribir</Button>
                </Box>
              ) : (
                <Card>
                  <CardContent>
                    <Typography color="success.main">Gracias por suscribirte. Te avisaremos novedades.</Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Container>
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
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography component={Link} to={currentUser ? '/dashboard' : '/'} variant="h6" sx={{ textDecoration: 'none', color: 'inherit' }}>AgroLink</Typography>

            <div>
              {currentUser ? (
                <>
                  <Button component={Link} to="/dashboard">Dashboard</Button>
                  {currentUser.roles.includes('ROLE_AGRICULTOR') && (
                    <>
                      <Button component={Link} to="/inventory">Inventario</Button>
                      <Button component={Link} to="/my-harvests">Mis Cosechas</Button>
                      <Button component={Link} to="/my-crops">Mis Cultivos</Button>
                    </>
                  )}
                  <Button href="/login" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login">Login</Button>
                  <Button component={Link} to="/register">Registro</Button>
                </>
              )}
            </div>
          </Container>
        </Toolbar>
      </AppBar>

      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route  path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />
          <Route   path="/create-product" element={currentUser ? <CreateProduct /> : <Navigate to="/login" />} />
          <Route path="/register-crop"element={currentUser ? <RegisterCrop /> : <Navigate to="/login" />} />
          <Route path="/marketplace" element={currentUser ? <Marketplace /> : <Navigate to="/login" />} />
          <Route path="/inventory" element={currentUser ? <Inventory /> : <Navigate to="/login" />} />
          <Route path="/cultivos/:id" element={currentUser ? <CropDetail /> : <Navigate to="/login" />} />
          <Route path="/cultivos/:id/register-harvest" element={currentUser ? <RegisterHarvest /> : <Navigate to="/login" />} />
          <Route path="/my-harvests" element={currentUser ? <MyHarvests /> : <Navigate to="/login" />} />
          <Route path="/my-crops" element={currentUser ? <MyCrops /> : <Navigate to="/login" />} />
        </Routes>
      </div>

      <Box component="footer" sx={{ py: 4, mt: 5, bgcolor: 'background.paper' }}>
        <Container sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">© {new Date().getFullYear()} AgroLink — Conectando el campo</Typography>
        </Container>
      </Box>
    </Router>
  );
}

export default App;