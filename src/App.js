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
import { AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, TextField, Box, Stack, InputAdornment, Divider, Menu, MenuItem, Badge, IconButton, Tooltip } from '@mui/material';
import { ShoppingBasket, Handshake, BarChart, LocalShipping, Chat, Search as SearchIcon, TrendingUp, PeopleAlt, ReceiptLong, ArrowDropDown, ChatBubbleOutline, Logout, Inventory2, ShoppingCart } from '@mui/icons-material';
import { CartProvider, useCart } from './context/CartContext';
import { NotificationsProvider, useNotifications } from './context/NotificationsContext';
import Checkout from './components/Checkout.jsx';
import Notifications from './components/Notifications.jsx';
import AdminOrders from './components/AdminOrders.jsx';
import MySales from './components/MySales.jsx';
import ReportSales from './components/ReportSales.jsx';
import ReportHarvests from './components/ReportHarvests.jsx';
import ReportCrops from './components/ReportCrops.jsx';
import MyOrders from './components/MyOrders.jsx';
import MyPurchases from './components/MyPurchases.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';


const Home = () => {
  const [search, setSearch] = React.useState('');
  const [stats, setStats] = React.useState({ products: 0, farmers: 0, orders: 0 });
  const [subscribed, setSubscribed] = React.useState(false);
  const [testimonialIndex, setTestimonialIndex] = React.useState(0);

  const features = [
    { id: 1, icon: <ShoppingBasket fontSize="large" color="primary" />, title: 'Publica tus productos', text: 'Sube tus cosechas y alcanza compradores locales con facilidad.' },
    { id: 2, icon: <Handshake fontSize="large" color="primary" />, title: 'Conecta y negocia', text: 'Comunícate directamente con compradores y gestiona acuerdos.' },
    { id: 3, icon: <BarChart fontSize="large" color="primary" />, title: 'Analiza tu producción', text: 'Paneles para monitorear rendimientos y ventas.' },
    { id: 4, icon: <LocalShipping fontSize="large" color="primary" />, title: 'Logística', text: 'Opciones de entrega y transporte local.' },
    { id: 5, icon: <Chat fontSize="large" color="primary" />, title: 'Mensajería', text: 'Comunícate en tiempo real con compradores y vendedores.' },
  ];

  const testimonials = [
    { name: 'María P.', text: 'Agrolink me permitió encontrar compradores locales en menos de una semana.' },
    { name: 'Carlos G.', text: 'Publicar mis productos fue muy sencillo y eficiente.' },
    { name: 'Lucía R.', text: 'Excelente plataforma para gestionar mis cosechas.' },
  ];

  React.useEffect(() => {
    const targets = { products: 124, farmers: 32, orders: 540 };
    const duration = 900;
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

  React.useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const filtered = features.filter(f => f.title.toLowerCase().includes(search.toLowerCase()) || f.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <main>
      {/* Hero */}
      <Box component="section" sx={{
        py: { xs: 8, md: 10 },
        background: 'linear-gradient(135deg, #4caf50 0%, #7cb342 40%, #cddc39 100%)',
        color: 'common.white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Plataforma agrícola</Typography>
              <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
                Conecta. Gestiona. Crece.
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, maxWidth: 520, opacity: 0.9 }}>
                AgroLink facilita el comercio agrícola y la gestión de cultivos con herramientas modernas y simples.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={Link} to="/register" size="large" variant="contained" color="primary">Comenzar</Button>
                <Button component={Link} to="/login" size="large" variant="outlined" color="inherit">Ingresar</Button>
              </Stack>
              <Stack direction="row" spacing={4} sx={{ mt: 6, flexWrap: 'wrap' }}>
                <Stack alignItems="flex-start">
                  <Typography variant="h4" fontWeight={700}>{stats.products}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}><TrendingUp fontSize="inherit" sx={{ mr: 0.5 }} />Productos</Typography>
                </Stack>
                <Stack alignItems="flex-start">
                  <Typography variant="h4" fontWeight={700}>{stats.farmers}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}><PeopleAlt fontSize="inherit" sx={{ mr: 0.5 }} />Agricultores</Typography>
                </Stack>
                <Stack alignItems="flex-start">
                  <Typography variant="h4" fontWeight={700}>{stats.orders}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}><ReceiptLong fontSize="inherit" sx={{ mr: 0.5 }} />Pedidos</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card elevation={6} sx={{
                backdropFilter: 'blur(6px)',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'common.white'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>¿Por qué AgroLink?</Typography>
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    Simplificamos la cadena agrícola desde la producción hasta la venta directa.
                  </Typography>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', my: 2 }} />
                  <Stack spacing={1}>
                    <Typography variant="body2">✔ Publicación sin complicaciones</Typography>
                    <Typography variant="body2">✔ Métricas en tiempo real</Typography>
                    <Typography variant="body2">✔ Comunicación directa</Typography>
                    <Typography variant="body2">✔ Apoyo a productores locales</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
        <Box sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25) 0%, transparent 60%)'
        }} />
      </Box>

      {/* Features & Content */}
      <Box component="section" sx={{ py: { xs: 8, md: 10 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={4} sx={{ mb: 2 }}>
            <Grid item xs={12} md={7}>
              <Typography variant="h4" fontWeight={700} gutterBottom>Lo que ofrecemos</Typography>
              <Typography variant="body1" color="text.secondary">Herramientas pensadas para facilitar el comercio y la gestión agrícola.</Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField fullWidth placeholder="Buscar funciones..." value={search} onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><SearchIcon /></InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {filtered.map(f => (
              <Grid item xs={12} sm={6} md={4} key={f.id}>
                <Card elevation={3} sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 1,
                  transition: 'transform .3s, box-shadow .3s',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 }
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ mb: 1 }}>{f.icon}</Box>
                    <Typography variant="h6" fontWeight={600}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{f.text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={6} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Testimonios</Typography>
              <Card sx={{
                p: 2,
                background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
                border: '1px solid',
                borderColor: 'success.light'
              }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>"{testimonials[testimonialIndex].text}"</Typography>
                  <Typography variant="caption" color="text.secondary">— {testimonials[testimonialIndex].name}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Suscríbete a novedades</Typography>
              {!subscribed ? (
                <Box component="form" onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} sx={{ display: 'flex', gap: 2 }}>
                  <TextField type="email" required placeholder="tu@correo.com" fullWidth />
                  <Button variant="contained">Suscribir</Button>
                </Box>
              ) : (
                <Card elevation={0} sx={{ background: 'linear-gradient(90deg,#c8e6c9,#dcedc8)' }}>
                  <CardContent>
                    <Typography color="success.main" fontWeight={600}>Gracias por suscribirte. Te avisaremos novedades.</Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </main>
  );
};


const CartNav = () => {
  const { count } = useCart() || { count: 0 };
  return (
    <IconButton component={Link} to="/checkout" aria-label={`Carrito${count ? ' ' + count : ''}`} color="primary">
      <Badge badgeContent={count} color="error" overlap="circular">
        <ShoppingCart />
      </Badge>
    </IconButton>
  );
};

const NotificationsNav = ({ currentUser }) => {
  const { getUnreadCount } = useNotifications() || {};
  const unread = currentUser?.email && getUnreadCount ? getUnreadCount(currentUser.email) : 0;
  if (!currentUser?.roles?.includes('ROLE_AGRICULTOR')) return null;
  return (
    <IconButton
      component={Link}
      to="/notificaciones"
      aria-label={`Notificaciones${unread ? ' ' + unread : ''}`}
      color="primary"
      sx={{ ml: 1 }}
    >
      {unread > 0 ? (
        <Badge badgeContent={unread} color="error" overlap="circular">
          <ChatBubbleOutline />
        </Badge>
      ) : (
        <ChatBubbleOutline />
      )}
    </IconButton>
  );
};

// Menús para ROLE_AGRICULTOR
const AgricultorMenus = () => {
  const [anchorProducto, setAnchorProducto] = React.useState(null);
  const [anchorReportes, setAnchorReportes] = React.useState(null);

  const openProducto = Boolean(anchorProducto);
  const openReportes = Boolean(anchorReportes);

  const handleOpen = (setter) => (e) => setter(e.currentTarget);
  const handleClose = (setter) => () => setter(null);

  return (
    <Stack direction="row" spacing={1} sx={{ display: 'inline-flex' }}>
      {/* Producto */}
      <>
        <Button
          id="btn-producto"
          aria-controls={openProducto ? 'menu-producto' : undefined}
          aria-haspopup="true"
          aria-expanded={openProducto ? 'true' : undefined}
          onClick={handleOpen(setAnchorProducto)}
          endIcon={<ArrowDropDown />}
        >Producto</Button>
        <Menu
          id="menu-producto"
          anchorEl={anchorProducto}
          open={openProducto}
          onClose={handleClose(setAnchorProducto)}
          MenuListProps={{ 'aria-labelledby': 'btn-producto' }}
        >
          <MenuItem component={Link} to="/my-harvests" onClick={handleClose(setAnchorProducto)}>Mis Cosechas</MenuItem>
          <MenuItem component={Link} to="/my-crops" onClick={handleClose(setAnchorProducto)}>Mis Cultivos</MenuItem>
          <MenuItem component={Link} to="/mis-ventas" onClick={handleClose(setAnchorProducto)}>Mis Ventas</MenuItem>
        </Menu>
      </>
      {/* Reportes */}
      <>
        <Button
          id="btn-reportes"
          aria-controls={openReportes ? 'menu-reportes' : undefined}
          aria-haspopup="true"
          aria-expanded={openReportes ? 'true' : undefined}
          onClick={handleOpen(setAnchorReportes)}
          endIcon={<ArrowDropDown />}
        >Reportes</Button>
        <Menu
          id="menu-reportes"
          anchorEl={anchorReportes}
          open={openReportes}
          onClose={handleClose(setAnchorReportes)}
          MenuListProps={{ 'aria-labelledby': 'btn-reportes' }}
        >
          <MenuItem component={Link} to="/reportes/ventas" onClick={handleClose(setAnchorReportes)}>Rep. Ventas</MenuItem>
          <MenuItem component={Link} to="/reportes/cosechas" onClick={handleClose(setAnchorReportes)}>Rep. Cosechas</MenuItem>
          <MenuItem component={Link} to="/reportes/cultivos" onClick={handleClose(setAnchorReportes)}>Rep. Cultivos</MenuItem>
        </Menu>
      </>
    </Stack>
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
    <NotificationsProvider>
    <CartProvider>
    <Router>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography component={Link} to={currentUser ? '/dashboard' : '/'} variant="h6" sx={{ textDecoration: 'none', color: 'inherit' }}>AgroLink</Typography>

              <div>
                {currentUser ? (
                  <>
                    {!currentUser.roles.includes('ROLE_AGRICULTOR') && !currentUser.roles.includes('ROLE_COMPRADOR') && (
                      <Button component={Link} to="/dashboard">Dashboard</Button>
                    )}
                    {currentUser.roles.includes('ROLE_AGRICULTOR') && (
                      <>
                        {/* Ícono Inventario para Agricultor */}
                        <Tooltip title="Inventario">
                          <IconButton component={Link} to="/inventory" aria-label="Inventario" color="primary">
                            <Inventory2 />
                          </IconButton>
                        </Tooltip>
                        <NotificationsNav currentUser={currentUser} />
                      </>
                    )}
                    {currentUser.roles.includes('ROLE_ADMINISTRADOR') && (
                      <Button component={Link} to="/admin/pedidos">Pedidos</Button>
                    )}
                    {currentUser.roles.includes('ROLE_COMPRADOR') && (
                      <>
                        <CartNav />
                      </>
                    )}
                    <Tooltip title="Salir">
                      <IconButton href="/login" onClick={handleLogout} aria-label="Salir" color="primary">
                        <Logout />
                      </IconButton>
                    </Tooltip>
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

        <Box sx={{ flexGrow: 1 }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/create-product" element={currentUser ? <CreateProduct /> : <Navigate to="/login" />} />
              <Route path="/register-crop" element={currentUser ? <RegisterCrop /> : <Navigate to="/login" />} />
              <Route path="/marketplace" element={currentUser ? <Marketplace /> : <Navigate to="/login" />} />
              <Route path="/inventory" element={currentUser ? <Inventory /> : <Navigate to="/login" />} />
              <Route path="/cultivos/:id" element={currentUser ? <CropDetail /> : <Navigate to="/login" />} />
              <Route path="/cultivos/:id/register-harvest" element={currentUser ? <RegisterHarvest /> : <Navigate to="/login" />} />
              <Route path="/my-harvests" element={currentUser ? <MyHarvests /> : <Navigate to="/login" />} />
              <Route path="/my-crops" element={currentUser ? <MyCrops /> : <Navigate to="/login" />} />
              <Route path="/checkout" element={currentUser ? <Checkout /> : <Navigate to="/login" />} />
              <Route path="/notificaciones" element={currentUser ? <Notifications /> : <Navigate to="/login" />} />
              <Route path="/admin/pedidos" element={currentUser ? <AdminOrders /> : <Navigate to="/login" />} />
              <Route path="/mis-ventas" element={currentUser ? <MySales /> : <Navigate to="/login" />} />
              <Route path="/reportes/ventas" element={currentUser ? <ReportSales /> : <Navigate to="/login" />} />
              <Route path="/reportes/cosechas" element={currentUser ? <ReportHarvests /> : <Navigate to="/login" />} />
              <Route path="/reportes/cultivos" element={currentUser ? <ReportCrops /> : <Navigate to="/login" />} />
              <Route path="/mis-pedidos" element={currentUser ? <MyOrders /> : <Navigate to="/login" />} />
              <Route path="/mis-compras" element={currentUser ? <MyPurchases /> : <Navigate to="/login" />} />
            </Routes>
          </ErrorBoundary>
        </Box>

        <Box component="footer" sx={{ py: 4, mt: 'auto', bgcolor: 'background.paper' }}>
          <Container sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">© {new Date().getFullYear()} AgroLink — Conectando el campo</Typography>
          </Container>
        </Box>
      </Box>
    </Router>
    </CartProvider>
    </NotificationsProvider>
  );
}

export default App;