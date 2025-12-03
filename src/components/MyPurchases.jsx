import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Alert, Stack, TextField, Button, Box, Paper, Avatar, Chip } from '@mui/material';
import { ShoppingBag, AttachMoney, FilterList, Replay, FileDownload } from '@mui/icons-material';
import dataService from '../services/dataService';

const MyPurchases = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataService.getMyPurchases();
      setItems(res.data || []);
    } catch (e) {
      setError(e?.response?.data || e?.message || 'Error al cargar compras');
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
    const q = sellerEmail.trim().toLowerCase();
    return items.filter(t => {
      if (fromTs || toTs) {
        const ts = t.transactionDate ? new Date(t.transactionDate).getTime() : null;
        if (fromTs && (ts == null || ts < fromTs)) return false;
        if (toTs) {
          const till = toTs + (24 * 60 * 60 * 1000) - 1;
          if (ts == null || ts > till) return false;
        }
      }
      const amt = Number(t.totalAmount || 0);
      if (min != null && amt < min) return false;
      if (max != null && amt > max) return false;
      if (q) {
        const se = (t.sellerEmail || '').toLowerCase();
        if (!se.includes(q)) return false;
      }
      return true;
    });
  }, [items, fromDate, toDate, minAmount, maxAmount, sellerEmail]);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setSellerEmail('');
  };

  const exportCsv = () => {
    const rows = filtered;
    const esc = (v) => {
      if (v == null) return '';
      const s = String(v);
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const fmtDate = (d) => d ? new Date(d).toISOString() : '';
    const fmtMoney = (n) => {
      const num = Number(n ?? 0);
      return num.toFixed(2);
    };
    const header = [
      'ID Transaccion',
      'ID Pedido',
      'Vendedor',
      'Comprador',
      'Monto Total',
      'Fecha'
    ];
    const lines = [header.join(',')];
    for (const t of rows) {
      lines.push([
        esc(t.id),
        esc(t.orderId),
        esc(t.sellerEmail),
        esc(t.buyerEmail),
        esc(fmtMoney(t.totalAmount)),
        esc(fmtDate(t.transactionDate))
      ].join(','));
    }
    const csvContent = '\ufeff' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().slice(0,10).replace(/-/g,'');
    a.href = url;
    a.download = `mis_compras_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
      <Container sx={{ py: 6 }}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.25)', width: 56, height: 56 }}>
              <ShoppingBag />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} color="common.white">Mis Compras</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Historial y filtros de compras</Typography>
            </Box>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button 
              onClick={() => load()} 
              startIcon={<Replay />} 
              fullWidth={{ xs: true, sm: false }}
              variant="contained"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.25)', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
              }}
            >
              Refrescar
            </Button>
            <Button 
              onClick={exportCsv} 
              startIcon={<FileDownload />} 
              fullWidth={{ xs: true, sm: false }}
              variant="contained"
              sx={{ 
                bgcolor: '#2c3e50',
                color: 'white',
                '&:hover': { bgcolor: '#1a252f' }
              }}
            >
              Exportar CSV
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.25)', borderRadius: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FilterList sx={{ color: 'white' }} />
              <Typography variant="subtitle2" color="white" fontWeight={600}>Filtros</Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField 
                label="Desde" 
                type="date" 
                size="small" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)} 
                InputLabelProps={{ shrink: true }} 
                fullWidth
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
              <TextField 
                label="Hasta" 
                type="date" 
                size="small" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
                InputLabelProps={{ shrink: true }} 
                fullWidth
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField 
                label="Mín. monto" 
                type="number" 
                size="small" 
                value={minAmount} 
                onChange={(e) => setMinAmount(e.target.value)} 
                inputProps={{ step: '0.01' }} 
                fullWidth
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
              <TextField 
                label="Máx. monto" 
                type="number" 
                size="small" 
                value={maxAmount} 
                onChange={(e) => setMaxAmount(e.target.value)} 
                inputProps={{ step: '0.01' }} 
                fullWidth
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
            </Stack>
            <TextField 
              label="Email vendedor" 
              size="small" 
              value={sellerEmail} 
              onChange={(e) => setSellerEmail(e.target.value)} 
              fullWidth
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
              <Button 
                variant="contained" 
                onClick={clearFilters}
                fullWidth={{ xs: true, sm: false }}
                sx={{ 
                  bgcolor: 'white', 
                  color: '#f5576c',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                Limpiar
              </Button>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                  alignSelf: { xs: 'flex-start', sm: 'center' },
                  px: 2
                }}
              >
                📊 Mostrando {filtered.length} transacciones
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {loading ? (
          <Typography color="common.white">Cargando...</Typography>
        ) : filtered.length === 0 ? (
          <Typography color="common.white">No hay transacciones.</Typography>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((t) => (
              <Grid item xs={12} md={6} key={t.id}>
                <Card sx={{ background: 'rgba(255,255,255,0.9)', borderRadius: 3 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AttachMoney color="success" />
                        <Typography variant="h6">Transacción #{t.id}</Typography>
                      </Stack>
                      <Chip size="small" label={`$${t.totalAmount ?? 0}`} color="success" variant="outlined" />
                    </Stack>
                    <Typography variant="body2">Pedido: #{t.orderId}</Typography>
                    <Typography variant="body2">Vendedor: {t.sellerEmail || '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">Fecha: {t.transactionDate ? new Date(t.transactionDate).toLocaleString() : '-'}</Typography>
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

export default MyPurchases;
