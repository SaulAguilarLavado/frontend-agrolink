import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import dataService from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, TextField, Button, Stack, Alert, Box, Paper, Chip, Divider } from '@mui/material';
import { useNotifications } from '../context/NotificationsContext';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const Checkout = () => {
  const { items, updateQty, removeItem, clear, total } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const notifications = useNotifications();

  const orderItems = useMemo(() => items.map(i => ({ productId: i.productId, quantity: Number(i.quantity) || 1 })), [items]);

  const handlePlaceOrder = async () => {
    if (orderItems.length === 0) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await dataService.createOrder(orderItems);
      // Crear recordatorios locales para agricultores afectados
      items.forEach((i) => {
        if (i.farmerEmail) {
          notifications?.addFor(i.farmerEmail, {
            title: 'Nuevo pedido',
            message: `Pedido recibido: ${i.quantity} ${i.unitOfMeasure} de ${i.name}.`,
            meta: { productId: i.productId, qty: i.quantity },
          });
        }
      });
      setMessage({ type: 'success', text: '¡Pedido creado exitosamente!' });
      clear();
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (e) {
      const text = (e?.response?.data) || e?.message || 'Error al crear el pedido';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <ShoppingCartCheckoutIcon sx={{ fontSize: 40, color: '#ee5a6f' }} />
            Checkout
          </Typography>
        </Paper>

        {items.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <Typography variant="h6">No tienes productos en el carrito.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                {items.map((i) => (
                  <Card key={i.productId} sx={{ 
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.95)',
                    transition: 'box-shadow 0.3s',
                    '&:hover': {
                      boxShadow: '0 8px 16px rgba(238, 90, 111, 0.2)'
                    }
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ee5a6f' }}>{i.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Precio: ${i.pricePerUnit} / {i.unitOfMeasure}</Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          type="number"
                          size="small"
                          label="Cantidad"
                          inputProps={{ min: 1, step: '1' }}
                          value={i.quantity}
                          onChange={(e) => updateQty(i.productId, e.target.value)}
                          sx={{ width: 120 }}
                        />
                        <Button 
                          color="error" 
                          variant="outlined" 
                          startIcon={<DeleteIcon />}
                          onClick={() => removeItem(i.productId)}
                        >
                          Eliminar
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 3, 
                background: 'rgba(255,255,255,0.95)',
                position: 'sticky',
                top: 20
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Resumen</Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6">Total:</Typography>
                    <Chip 
                      icon={<AttachMoneyIcon />}
                      label={`$${total.toFixed(2)}`}
                      color="success"
                      sx={{ fontWeight: 'bold', fontSize: '1.1rem', px: 2 }}
                    />
                  </Box>

                  <Button 
                    fullWidth 
                    size="large"
                    variant="contained" 
                    onClick={handlePlaceOrder} 
                    disabled={submitting}
                    sx={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                      fontWeight: 'bold',
                      py: 1.5,
                      mb: 2,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #e65555 0%, #d44e5f 100%)',
                      }
                    }}
                  >
                    {submitting ? 'Enviando...' : 'Realizar pedido'}
                  </Button>
                  
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={() => clear()} 
                    disabled={submitting}
                    sx={{ color: '#ee5a6f' }}
                  >
                    Vaciar carrito
                  </Button>
                  
                  {message && (
                    <Alert sx={{ mt: 2 }} severity={message.type}>{message.text}</Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Checkout;
