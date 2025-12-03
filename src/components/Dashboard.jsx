import React from 'react';
import authService from '../services/authService';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, Button, Chip, Stack, Box, Paper, Avatar } from '@mui/material';
import { Agriculture, AddBox, Assessment, Store, Inventory2, TrendingUp, ShoppingCart, LocalShipping, Grass, AttachMoney, BarChart, PieChart, ShowChart, ShoppingBag } from '@mui/icons-material';
import dataService from '../services/dataService';

const Dashboard = () => {
  const currentUser = authService.getCurrentUser();

  // Roles calculados de forma segura (evita hooks condicionales)
  const isAgricultor = !!currentUser && currentUser.roles.includes('ROLE_AGRICULTOR');
  const isComprador = !!currentUser && currentUser.roles.includes('ROLE_COMPRADOR');

  const [harvestCount, setHarvestCount] = React.useState(null);
  const [cropCount, setCropCount] = React.useState(null);
  const [salesCount, setSalesCount] = React.useState(null);

  React.useEffect(() => {
    if (!currentUser || !isAgricultor) return; // evita llamadas innecesarias
    let active = true;
    (async () => {
      try {
        const [harvestRes, cropRes, salesRes] = await Promise.all([
          dataService.getMyHarvests().catch(() => null),
          dataService.getMyCrops().catch(() => null),
          dataService.getMySales().catch(() => null),
        ]);
        if (!active) return;
        setHarvestCount(Array.isArray(harvestRes?.data) ? harvestRes.data.length : (harvestRes?.data?.content?.length || null));
        setCropCount(Array.isArray(cropRes?.data) ? cropRes.data.length : (cropRes?.data?.content?.length || null));
        setSalesCount(Array.isArray(salesRes?.data) ? salesRes.data.length : (salesRes?.data?.content?.length || null));
      } catch (_) {
        // silencioso
      }
    })();
    return () => { active = false; };
  }, [currentUser, isAgricultor]);

  // Early return seguro después de definir hooks
  if (!currentUser) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Paper elevation={3} sx={{ p: 6, borderRadius: 3, textAlign: 'center', maxWidth: 500 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#764ba2' }}>
            ⚠️ No estás autorizado
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Inicia sesión para acceder al panel.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero superior mejorado */}
      <Box sx={{
        py: { xs: 8, md: 10 },
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: '2rem',
              border: '3px solid rgba(255,255,255,0.3)'
            }}>
              {(currentUser.name?.[0] || currentUser.email?.[0] || '?').toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                ¡Hola, {(currentUser.name || currentUser.lastname) ? `${currentUser.name || ''} ${currentUser.lastname || ''}`.trim() : currentUser.email}! 👋
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Gestiona tu negocio agrícola desde aquí
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
            {currentUser.roles.map((r) => {
              const label = r === 'ROLE_AGRICULTOR' ? '🌾 Agricultor' : r === 'ROLE_COMPRADOR' ? '🛒 Comprador' : r;
              return (
                <Chip 
                  key={r} 
                  label={label} 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.25)', 
                    color: 'white',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }} 
                />
              );
            })}
          </Stack>

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={6} sm={4} md={3}>
              <Paper elevation={0} sx={{
                textAlign: 'center',
                p: 3,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 3,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <TrendingUp sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>124</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Productos
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Paper elevation={0} sx={{
                textAlign: 'center',
                p: 3,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 3,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <Agriculture sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                  {cropCount ?? 32}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Cultivos
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Paper elevation={0} sx={{
                textAlign: 'center',
                p: 3,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 3,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <ShoppingCart sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                  {salesCount ?? 540}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Ventas
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Paper elevation={0} sx={{
                textAlign: 'center',
                p: 3,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 3,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <LocalShipping sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                  {harvestCount ?? 28}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Cosechas
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contenido principal */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {isAgricultor && (
            <>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Card sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(129, 199, 132, 0.9) 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                        <Inventory2 sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700}>Producción</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.95 }}>
                      Crea productos y registra cultivos para tu negocio
                    </Typography>
                    <Stack spacing={2}>
                      <Button
                        component={RouterLink}
                        to="/create-product"
                        variant="contained"
                        fullWidth
                        startIcon={<AddBox />}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.25)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          fontWeight: 'bold',
                          py: 1.5,
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                        }}
                      >
                        Crear Producto
                      </Button>
                      <Button
                        component={RouterLink}
                        to="/register-crop"
                        variant="contained"
                        fullWidth
                        startIcon={<Agriculture />}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.25)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          fontWeight: 'bold',
                          py: 1.5,
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                        }}
                      >
                        Registrar Cultivo
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
                
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Card sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 167, 38, 0.9) 0%, rgba(251, 192, 45, 0.9) 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                        <LocalShipping sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>Cosechas</Typography>
                        <Chip 
                          label={`${harvestCount ?? 0} registradas`} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.25)', 
                            color: 'white',
                            mt: 0.5,
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.95 }}>
                      Gestiona tus cosechas y su historial
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/my-harvests"
                      variant="contained"
                      fullWidth
                      startIcon={<Grass />}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontWeight: 'bold',
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                      }}
                    >
                      Ver Cosechas
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Card sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.9) 0%, rgba(156, 39, 176, 0.9) 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                        <Agriculture sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>Cultivos</Typography>
                        <Chip 
                          label={`${cropCount ?? 0} activos`} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.25)', 
                            color: 'white',
                            mt: 0.5,
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.95 }}>
                      Supervisa el estado de tus cultivos
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/my-crops"
                      variant="contained"
                      fullWidth
                      startIcon={<Agriculture />}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontWeight: 'bold',
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                      }}
                    >
                      Ver Cultivos
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(233, 30, 99, 0.9) 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                        <AttachMoney sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>Ventas</Typography>
                        <Chip 
                          label={`${salesCount ?? 0} realizadas`} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.25)', 
                            color: 'white',
                            mt: 0.5,
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.95 }}>
                      Revisa tus transacciones y órdenes
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/mis-ventas"
                      variant="contained"
                      fullWidth
                      startIcon={<AttachMoney />}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontWeight: 'bold',
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                      }}
                    >
                      Ver Ventas
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {(isAgricultor || isComprador) && (
            <Grid item xs={12}>
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(0, 150, 136, 0.9) 0%, rgba(77, 182, 172, 0.9) 100%)',
                color: 'white',
                borderRadius: 3,
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 300,
                  height: 300,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                      <Assessment sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h5" fontWeight={700}>Reportes y Seguimiento</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.95 }}>
                    Accede a informes detallados de tu actividad
                  </Typography>
                  <Grid container spacing={{ xs: 1, sm: 2 }}>
                    {isAgricultor && (
                      <>
                        <Grid item xs={12} sm={4}>
                          <Button
                            component={RouterLink}
                            to="/reportes/ventas"
                            variant="contained"
                            fullWidth
                            startIcon={<BarChart />}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.25)',
                              backdropFilter: 'blur(10px)',
                              color: 'white',
                              fontWeight: 'bold',
                              py: 1.5,
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                            }}
                          >
                            Reporte Ventas
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Button
                            component={RouterLink}
                            to="/reportes/cosechas"
                            variant="contained"
                            fullWidth
                            startIcon={<PieChart />}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.25)',
                              backdropFilter: 'blur(10px)',
                              color: 'white',
                              fontWeight: 'bold',
                              py: 1.5,
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                            }}
                          >
                            Reporte Cosechas
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Button
                            component={RouterLink}
                            to="/reportes/cultivos"
                            variant="contained"
                            fullWidth
                            startIcon={<ShowChart />}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.25)',
                              backdropFilter: 'blur(10px)',
                              color: 'white',
                              fontWeight: 'bold',
                              py: 1.5,
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                            }}
                          >
                            Reporte Cultivos
                          </Button>
                        </Grid>
                      </>
                    )}
                    {isComprador && (
                      <Grid item xs={12} sm={6}>
                        <Button
                          component={RouterLink}
                          to="/mis-compras"
                          variant="contained"
                          fullWidth
                          startIcon={<ShoppingBag />}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            fontWeight: 'bold',
                            py: 1.5,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                          }}
                        >
                          Mis Compras
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {isComprador && (
            <>
              <Grid item xs={12} sm={6} md={6}>
                <Card sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.9) 0%, rgba(3, 169, 244, 0.9) 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                        <ShoppingCart sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700}>Marketplace</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.95 }}>
                      Explora productos agrícolas disponibles
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/marketplace"
                      variant="contained"
                      fullWidth
                      startIcon={<Store />}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontWeight: 'bold',
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                      }}
                    >
                      Ir al Marketplace
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Card sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.9) 0%, rgba(233, 30, 99, 0.9) 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                        <LocalShipping sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700}>Mis Pedidos</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.95 }}>
                      Revisa el estado de tus compras
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/mis-pedidos"
                      variant="contained"
                      fullWidth
                      startIcon={<ShoppingBag />}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontWeight: 'bold',
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                      }}
                    >
                      Ver Mis Pedidos
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;