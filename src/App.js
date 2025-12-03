import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';

// Importación de todos los componentes
import Login from './components/login.jsx';
import Register from './components/Register.jsx';
import Dashboard from './components/Dashboard.jsx';
import CreateProduct from './components/CreateProduct.jsx';
import RegisterCrop from './components/RegisterCrop.jsx';
import Marketplace from './components/Marketplace.jsx';
import Inventory from './components/Inventory.jsx';
import CropDetail from './components/CropDetail.jsx';
import RegisterHarvest from './components/RegisterHarvest.jsx';
import MyHarvests from './components/MyHarvests.jsx';
import MyCrops from './components/MyCrops.jsx';
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

// Contextos y Servicios
import authService from './services/authService';
import dataService from './services/dataService';
import { CartProvider, useCart } from './context/CartContext';
import { NotificationsProvider } from './context/NotificationsContext';

// Componentes de Material UI e Iconos
import { AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, Box, Stack, Divider, Badge, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { TrendingUp, PeopleAlt, ReceiptLong, Logout, ShoppingCart, Notifications as NotificationsIcon, Menu as MenuIcon } from '@mui/icons-material';

import './App.css';

// ========================
//    COMPONENTE: HOME (Sin cambios)
// ========================
const Home = () => {
    // ... (El código de Home se queda exactamente como lo tienes)
    const [stats, setStats] = React.useState({ products: 0, farmers: 0, orders: 0 });
    React.useEffect(() => { const targets = { products: 124, farmers: 32, orders: 540 }; const start = Date.now(); const duration = 900; const animate = () => { const progress = Math.min(1, (Date.now() - start) / duration); setStats({ products: Math.floor(progress * targets.products), farmers: Math.floor(progress * targets.farmers), orders: Math.floor(progress * targets.orders), }); if (progress < 1) requestAnimationFrame(animate); }; animate(); }, []);
    return (
        <main>
            <Box sx={{ py: { xs: 10, md: 14 }, minHeight: { xs: "70vh", md: "85vh" }, backgroundImage: 'url("/images/hero-agro.jpeg")', backgroundSize: "cover", backgroundPosition: "center", color: "white", position: "relative", display: "flex", alignItems: "center", "&::before": { content: '""', position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.15) 100%)", zIndex: 1, }, }}>
                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
                    <Grid container spacing={6} alignItems="center"><Grid item xs={12} md={7}><Typography variant="overline" sx={{ opacity: 0.85 }}>Plataforma agrícola</Typography><Typography variant="h3" fontWeight={700} gutterBottom>Conecta. Gestiona. Crece.</Typography><Typography variant="h6" sx={{ mb: 4, maxWidth: 500, opacity: 0.9 }}>El comercio agrícola hecho simple.</Typography><Stack direction={{ xs: "column", sm: "row" }} spacing={2}><Button component={RouterLink} to="/register" variant="contained" color="primary" size="large">Comenzar</Button><Button component={RouterLink} to="/login" variant="outlined" sx={{ color: "white", borderColor: "white" }} size="large">Ingresar</Button></Stack><Stack direction="row" spacing={5} sx={{ mt: 6, flexWrap: "wrap" }}><Stack><Typography variant="h4" fontWeight={700}>{stats.products}</Typography><Typography variant="body2" sx={{ opacity: 0.85 }}><TrendingUp fontSize="inherit" sx={{ mr: 0.5 }} />Productos</Typography></Stack><Stack><Typography variant="h4" fontWeight={700}>{stats.farmers}</Typography><Typography variant="body2" sx={{ opacity: 0.85 }}><PeopleAlt fontSize="inherit" sx={{ mr: 0.5 }} />Agricultores</Typography></Stack><Stack><Typography variant="h4" fontWeight={700}>{stats.orders}</Typography><Typography variant="body2" sx={{ opacity: 0.85 }}><ReceiptLong fontSize="inherit" sx={{ mr: 0.5 }} />Pedidos</Typography></Stack></Stack></Grid><Grid item xs={12} md={5}><Card elevation={6} sx={{ backdropFilter: "blur(4px)", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", }}><CardContent><Typography variant="h6">¿Por qué AgroLink?</Typography><Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>Simplificamos la cadena agrícola desde la producción hasta la venta directa.</Typography><Divider sx={{ borderColor: "rgba(255,255,255,0.3)", my: 2 }} /><Stack spacing={1}><Typography variant="body2">✔ Publicación rápida</Typography><Typography variant="body2">✔ Métricas en tiempo real</Typography><Typography variant="body2">✔ Comunicación directa</Typography><Typography variant="body2">✔ Apoyo a productores locales</Typography></Stack></CardContent></Card></Grid></Grid>
                </Container>
            </Box>
        </main>
    );
};

// ========================
//    COMPONENTES DE NAVEGACIÓN (AHORA PUEDEN USAR CONTEXTO)
// ========================
const CartNav = () => {
  const { count } = useCart() || {};
  return (
    <IconButton component={RouterLink} to="/checkout" color="inherit">
      <Badge badgeContent={count || 0} color="error"><ShoppingCart /></Badge>
    </IconButton>
  );
};

const NotificationsNav = React.memo(({ currentUser }) => {
  const [unreadCount, setUnreadCount] = React.useState(0);
  const navigate = useNavigate();
  
  // Usar el email como dependencia en lugar del objeto completo
  const userEmail = currentUser?.email;

  const loadUnreadCount = React.useCallback(async () => {
    if (!userEmail) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const count = await dataService.getUnreadNotificationsCount();
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setUnreadCount(0);
    }
  }, [userEmail]);

  React.useEffect(() => {
    loadUnreadCount();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  const handleClick = React.useCallback(() => {
    navigate('/notifications');
  }, [navigate]);

  return (
    <IconButton onClick={handleClick} color="inherit">
      <Badge badgeContent={unreadCount} color="error"><NotificationsIcon /></Badge>
    </IconButton>
  );
});

// ========================
//    COMPONENTE DE LAYOUT (NUEVO)
// ========================
const AppLayout = () => {
  const [currentUser, setCurrentUser] = React.useState(authService.getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setMobileMenuOpen(false);
    // Navegar al home después de logout
    return <Navigate to="/" />;
  };

  const isAgricultor = currentUser?.roles?.includes('ROLE_AGRICULTOR');
  const isComprador = currentUser?.roles?.includes('ROLE_COMPRADOR');
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMINISTRADOR');

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const menuItems = React.useMemo(() => {
    if (!currentUser) {
      return [
        { label: 'Login', path: '/login' },
        { label: 'Registro', path: '/register' }
      ];
    }

    const items = [{ label: 'Dashboard', path: '/dashboard' }];

    if (isAgricultor) {
      items.push(
        { label: 'Inventario', path: '/inventory' },
        { label: 'Mis Cultivos', path: '/my-crops' }
      );
    }

    if (isComprador) {
      items.push(
        { label: 'Mercado', path: '/marketplace' },
        { label: 'Mis Pedidos', path: '/mis-pedidos' }
      );
    }

    if (isAdmin) {
      items.push({ label: 'Admin Pedidos', path: '/admin/pedidos' });
    }

    return items;
  }, [currentUser, isAgricultor, isComprador, isAdmin]);

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
            <Typography 
              component={RouterLink} 
              to={currentUser ? "/dashboard" : "/"} 
              variant="h6" 
              sx={{ 
                textDecoration: "none", 
                color: "inherit",
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              AgroLink
            </Typography>

            {isMobile ? (
              // MOBILE: Hamburger Menu
              <Stack direction="row" spacing={1} alignItems="center">
                {currentUser && (
                  <>
                    {isComprador && <CartNav />}
                    <NotificationsNav currentUser={currentUser} />
                  </>
                )}
                <IconButton
                  color="inherit"
                  onClick={toggleMobileMenu}
                  edge="end"
                >
                  <MenuIcon />
                </IconButton>
              </Stack>
            ) : (
              // DESKTOP: Full Menu
              <Stack direction="row" spacing={1} alignItems="center">
                {currentUser ? (
                  <>
                    <Button component={RouterLink} to="/dashboard" color="inherit">Dashboard</Button>
                    {isAgricultor && (
                      <>
                        <Button component={RouterLink} to="/inventory" color="inherit">Inventario</Button>
                        <Button component={RouterLink} to="/my-crops" color="inherit">Mis Cultivos</Button>
                      </>
                    )}
                    {isComprador && (
                      <>
                        <Button component={RouterLink} to="/marketplace" color="inherit">Mercado</Button>
                        <Button component={RouterLink} to="/mis-pedidos" color="inherit">Mis Pedidos</Button>
                        <CartNav />
                      </>
                    )}
                    {isAdmin && <Button component={RouterLink} to="/admin/pedidos" color="inherit">Admin Pedidos</Button>}
                    <NotificationsNav currentUser={currentUser} />
                    <IconButton onClick={handleLogout} color="inherit"><Logout /></IconButton>
                  </>
                ) : (
                  <>
                    <Button component={RouterLink} to="/login" color="inherit">Login</Button>
                    <Button component={RouterLink} to="/register" color="inherit">Registro</Button>
                  </>
                )}
              </Stack>
            )}
          </Container>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            pt: 2
          }
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
          {currentUser && (
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Cerrar Sesión" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, py: { xs: 1, sm: 2 }, minHeight: 'calc(100vh - 200px)' }}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={currentUser ? <Notifications /> : <Navigate to="/login" />} />
            <Route path="/inventory" element={currentUser && isAgricultor ? <Inventory /> : <Navigate to="/dashboard" />} />
            <Route path="/create-product" element={currentUser && isAgricultor ? <CreateProduct /> : <Navigate to="/dashboard" />} />
            <Route path="/register-crop" element={currentUser && isAgricultor ? <RegisterCrop /> : <Navigate to="/dashboard" />} />
            <Route path="/my-harvests" element={currentUser && isAgricultor ? <MyHarvests /> : <Navigate to="/dashboard" />} />
            <Route path="/my-crops" element={currentUser && isAgricultor ? <MyCrops /> : <Navigate to="/dashboard" />} />
            <Route path="/cultivos/:id" element={currentUser && isAgricultor ? <CropDetail /> : <Navigate to="/dashboard" />} />
            <Route path="/cultivos/:id/register-harvest" element={currentUser && isAgricultor ? <RegisterHarvest /> : <Navigate to="/dashboard" />} />
            <Route path="/mis-ventas" element={currentUser && isAgricultor ? <MySales /> : <Navigate to="/dashboard" />} />
            <Route path="/reportes/ventas" element={currentUser && isAgricultor ? <ReportSales /> : <Navigate to="/dashboard" />} />
            <Route path="/reportes/cosechas" element={currentUser && isAgricultor ? <ReportHarvests /> : <Navigate to="/dashboard" />} />
            <Route path="/reportes/cultivos" element={currentUser && isAgricultor ? <ReportCrops /> : <Navigate to="/dashboard" />} />
            <Route path="/marketplace" element={currentUser && isComprador ? <Marketplace /> : <Navigate to="/dashboard" />} />
            <Route path="/checkout" element={currentUser && isComprador ? <Checkout /> : <Navigate to="/dashboard" />} />
            <Route path="/mis-pedidos" element={currentUser && isComprador ? <MyOrders /> : <Navigate to="/dashboard" />} />
            <Route path="/mis-compras" element={currentUser && isComprador ? <MyPurchases /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/pedidos" element={currentUser && isAdmin ? <AdminOrders /> : <Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/"} />} />
          </Routes>
        </ErrorBoundary>
      </Box>

      <Box 
        component="footer" 
        sx={{ 
          py: { xs: 2, sm: 4 }, 
          mt: 'auto', 
          textAlign: 'center',
          borderTop: '1px solid #e0e0e0',
          bgcolor: '#f5f5f5'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} AgroLink — Conectando el campo
        </Typography>
      </Box>
    </>
  );
}

// ========================
//        APP WRAPPER (NUEVO)
// ========================
function App() {
  return (
    <NotificationsProvider>
      <CartProvider>
        <Router>
          <AppLayout />
        </Router>
      </CartProvider>
    </NotificationsProvider>
  );
}

export default App;