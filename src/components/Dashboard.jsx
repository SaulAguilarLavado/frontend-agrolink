import React from 'react';
import authService from '../services/authService';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, Button, Chip, Stack } from '@mui/material';
import Inventory from './Inventory';

const Dashboard = () => {
  const currentUser = authService.getCurrentUser();

  // Si no hay usuario, no mostramos nada o redirigimos (manejo en App.jsx)
  if (!currentUser) {
    return <h2>No estás autorizado para ver esta página.</h2>;
  }

  // Verificamos si el rol 'ROLE_AGRICULTOR' está en la lista de roles del usuario
  const isAgricultor = currentUser.roles.includes('ROLE_AGRICULTOR');
  
  // Verificamos si el rol 'ROLE_COMPRADOR' está presente
  const isComprador = currentUser.roles.includes('ROLE_COMPRADOR');

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Bienvenido, <strong>{(currentUser.name || currentUser.lastname) ? `${currentUser.name || ''} ${currentUser.lastname || ''}`.trim() : currentUser.email}</strong></Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }} alignItems="center">
        <Chip label="Roles" color="info" />
        {currentUser.roles.map((r) => {
          const label = r === 'ROLE_AGRICULTOR' ? 'Agricultor' : r === 'ROLE_COMPRADOR' ? 'Comprador' : r;
          return <Chip key={r} label={label} color="default" />;
        })}
      </Stack>

      <Grid container spacing={3}>
        {isAgricultor && (
          <>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6">Panel de Agricultor</Typography>
                  <Typography variant="body2" color="text.secondary">Aquí puedes gestionar tus productos y cultivos.</Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button component={RouterLink} to="/create-product" variant="contained" color="success">Crear Producto</Button>
                    <Button component={RouterLink} to="/register-crop" variant="outlined">Registrar Cultivo</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Inventory />
            </Grid>
          </>
        )}

        {isComprador && (
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">Panel de Comprador</Typography>
                <Typography variant="body2" color="text.secondary">Aquí puedes buscar productos y realizar pedidos.</Typography>
                <Stack sx={{ mt: 2 }}>
                  <Button component={RouterLink} to="/marketplace" variant="contained">Ver Productos en el Mercado</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;