import React, { useMemo } from 'react';
import { Container, Typography, Card, CardContent, Stack, Button, Alert, Box, Paper, Chip, Badge } from '@mui/material';
import { useNotifications } from '../context/NotificationsContext';
import authService from '../services/authService';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Notifications = () => {
  const currentUser = authService.getCurrentUser();
  const email = currentUser?.email || null;
  const { getFor, markRead, markAllRead, clearFor, getUnreadCount } = useNotifications() || {};

  const list = useMemo(() => (email && getFor ? getFor(email) : []), [email, getFor]);
  const unread = useMemo(() => (email && getUnreadCount ? getUnreadCount(email) : 0), [email, getUnreadCount, list]);

  if (!email) {
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
                onClick={() => markAllRead(email)} 
                disabled={list.length === 0}
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
                onClick={() => clearFor(email)} 
                disabled={list.length === 0}
              >
                Limpiar
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {list.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <NotificationsIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No tienes notificaciones</Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {list.map((n) => (
              <Card 
                key={n.id} 
                sx={{ 
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  borderLeft: n.read ? '4px solid #e0e0e0' : '4px solid #4facfe',
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
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: n.read ? '#666' : '#00f2fe' }}>
                          {n.title}
                        </Typography>
                        {!n.read && (
                          <Chip 
                            label="Nueva" 
                            color="primary" 
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                      </Stack>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {n.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        📅 {new Date(n.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    {!n.read && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => markRead(email, n.id)}
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
