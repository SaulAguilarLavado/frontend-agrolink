import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Card, CardContent, Stack, Button, Alert, Box, Paper, Chip, Badge, CircularProgress } from '@mui/material';
import authService from '../services/authService';
import dataService from '../services/dataService';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

const Notifications = () => {
  const currentUser = authService.getCurrentUser();
  const userEmail = currentUser?.email; // Usar solo el email como dependencia
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await dataService.getMyNotifications();
      setNotifications(response.data || []);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await dataService.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, leido: true } : n)
      );
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await dataService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    try {
      await dataService.clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Error al limpiar notificaciones:', err);
    }
  }, []);

  const unread = notifications.filter(n => !n.leido).length;

  if (!currentUser) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <Alert severity="info">Debes iniciar sesión para ver tus notificaciones.</Alert>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge badgeContent={unread} color="error">
                <NotificationsActiveIcon sx={{ fontSize: 40, color: '#00f2fe' }} />
              </Badge>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Notificaciones
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button 
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={loadNotifications}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a4293 100%)' }
                }}
              >
                Actualizar
              </Button>
              <Button 
                variant="contained" 
                onClick={handleMarkAllAsRead} 
                disabled={notifications.length === 0 || unread === 0}
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #3a8cce 0%, #00d4e6 100%)' }
                }}
              >
                Marcar todas leídas
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleClearAll} 
                disabled={notifications.length === 0}
              >
                Limpiar
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {error && (
          <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <Alert severity="error">{error}</Alert>
          </Paper>
        )}

        {notifications.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <NotificationsIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No tienes notificaciones</Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {notifications.map((n) => (
              <Card 
                key={n.id} 
                sx={{ 
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  borderLeft: n.leido ? '4px solid #e0e0e0' : '4px solid #4facfe',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: '0 8px 16px rgba(79, 172, 254, 0.2)'
                  }
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: n.leido ? '#666' : '#00f2fe' }}>
                          {n.mensaje}
                        </Typography>
                        {!n.leido && (
                          <Chip 
                            label="Nueva" 
                            color="primary" 
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        📅 {new Date(n.fechaCreacion).toLocaleString('es-ES')}
                      </Typography>
                    </Box>
                    {!n.leido && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleMarkAsRead(n.id)}
                        sx={{
                          borderColor: '#4facfe',
                          color: '#4facfe',
                          '&:hover': { borderColor: '#3a8cce', background: 'rgba(79, 172, 254, 0.1)' }
                        }}
                      >
                        Marcar leída
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default Notifications;
