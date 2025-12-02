import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Alert, Stack, TextField, Button, Box, Paper, Chip } from '@mui/material';
import dataService from '../services/dataService';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';

const MySales = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataService.getMySales();
      setItems(res.data || []);
    } catch (e) {
      setError(e?.response?.data || e?.message || 'Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const fromTs = fromDate ? new Date(fromDate).getTime() : null;
    const toTs = toDate ? new Date(toDate).getTime() : null;
    const min = minAmount !== '' ? Number(minAmount) : null;
    const max = maxAmount !== '' ? Number(maxAmount) : null;
    const q = buyerEmail.trim().toLowerCase();
    return items.filter(t => {
      // date filter
      if (fromTs || toTs) {
        const ts = t.transactionDate ? new Date(t.transactionDate).getTime() : null;
        if (fromTs && (ts == null || ts < fromTs)) return false;
        if (toTs) {
          const till = toTs + (24 * 60 * 60 * 1000) - 1; // include entire day
          if (ts == null || ts > till) return false;
        }
      }
      // amount filter
      const amt = Number(t.totalAmount || 0);
      if (min != null && amt < min) return false;
      if (max != null && amt > max) return false;
      // email filter
      if (q) {
        const be = (t.buyerEmail || '').toLowerCase();
        if (!be.includes(q)) return false;
      }
      return true;
    });
  }, [items, fromDate, toDate, minAmount, maxAmount, buyerEmail]);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setBuyerEmail('');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <AttachMoneyIcon sx={{ fontSize: 40, color: '#f5576c' }} />
            Mis Ventas
          </Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {loading ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <Typography>Cargando...</Typography>
          </Paper>
        ) : items.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <Typography>No hay transacciones.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                  🔍 Filtrar Ventas
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <TextField label="Desde" type="date" size="small" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                  <TextField label="Hasta" type="date" size="small" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                  <TextField label="Mín. monto" type="number" size="small" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} inputProps={{ step: '0.01' }} />
                  <TextField label="Máx. monto" type="number" size="small" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} inputProps={{ step: '0.01' }} />
                  <TextField label="Email comprador" size="small" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
                  <Button 
                    onClick={clearFilters}
                    sx={{
                      borderColor: '#f5576c',
                      color: '#f5576c',
                      '&:hover': { borderColor: '#d44357', background: 'rgba(245, 87, 108, 0.1)' }
                    }}
                  >
                    Limpiar
                  </Button>
                </Stack>
              </Paper>
            </Grid>
            {filtered.map((t) => (
              <Grid item xs={12} sm={6} md={4} key={t.id}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(245, 87, 108, 0.3)'
                  },
                  background: 'rgba(255,255,255,0.95)'
                }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f5576c', mb: 2 }}>
                      Transacción #{t.id}
                    </Typography>
                    
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingBagIcon color="action" fontSize="small" />
                        <Typography variant="body2">Pedido: #{t.orderId}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="action" fontSize="small" />
                        <Typography variant="body2">{t.buyerEmail || '-'}</Typography>
                      </Box>

                      <Chip 
                        icon={<AttachMoneyIcon />}
                        label={`$${t.totalAmount ?? 0}`}
                        color="success"
                        sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                      />

                      <Typography variant="caption" color="text.secondary">
                        📅 {t.transactionDate ? new Date(t.transactionDate).toLocaleString() : '-'}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MySales;
