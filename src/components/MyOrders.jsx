import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Alert, Stack, Chip, Divider, Box, Button, Avatar, Paper, IconButton } from '@mui/material';
import { LocalShipping, ReceiptLong, Replay, FilterList, FileDownload } from '@mui/icons-material';
import dataService from '../services/dataService';

const StatusChip = ({ status, onClick, selected }) => {
  const map = {
    PENDIENTE: { color: 'default', icon: <ReceiptLong fontSize="small" /> },
    CONFIRMADO: { color: 'primary', icon: <ReceiptLong fontSize="small" /> },
    ENVIADO: { color: 'info', icon: <LocalShipping fontSize="small" /> },
    COMPLETADO: { color: 'success', icon: <LocalShipping fontSize="small" /> },
    RECHAZADO: { color: 'error', icon: <ReceiptLong fontSize="small" /> },
  };
  const cfg = map[status] || { color: 'default' };
  return (
    <Chip
      size="small"
      color={cfg.color}
      variant={selected ? 'filled' : 'outlined'}
      onClick={onClick}
      icon={cfg.icon}
      label={status}
      sx={{ fontWeight: 600 }}
    />
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataService.getMyOrders();
      setOrders(res.data || []);
    } catch (e) {
      setError(e?.response?.data || e?.message || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'TODOS') return orders;
    return orders.filter(o => (o.status || '').toUpperCase() === statusFilter);
  }, [orders, statusFilter]);

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
      'ID Pedido',
      'Fecha',
      'Estado',
      'Total',
      'Items'
    ];
    const lines = [header.join(',')];
    for (const o of rows) {
      const itemsCount = Array.isArray(o.details) ? o.details.reduce((acc, d) => acc + (Number(d.quantity)||0), 0) : 0;
      lines.push([
        esc(o.orderId),
        esc(fmtDate(o.orderDate)),
        esc((o.status||'').toUpperCase()),
        esc(fmtMoney(o.totalAmount)),
        esc(itemsCount)
      ].join(','));
    }
    const csvContent = '\ufeff' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().slice(0,10).replace(/-/g,'');
    a.href = url;
    a.download = `mis_pedidos_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
      <Container sx={{ py: 6 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.25)', width: 56, height: 56 }}>
            <LocalShipping />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} color="common.white">Mis Pedidos</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Revisa el estado de tus órdenes</Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={load} sx={{ color: 'white' }} aria-label="Refrescar">
            <Replay />
          </IconButton>
          <Button onClick={exportCsv} startIcon={<FileDownload />} sx={{ color: 'white' }}>Exportar CSV</Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.25)', borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <FilterList sx={{ mr: 1 }} />
            {['TODOS', 'PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'COMPLETADO', 'RECHAZADO'].map(s => (
              <StatusChip key={s} status={s} selected={statusFilter === s} onClick={() => setStatusFilter(s)} />
            ))}
          </Stack>
        </Paper>

        {loading ? (
          <Typography color="common.white">Cargando...</Typography>
        ) : filtered.length === 0 ? (
          <Typography color="common.white">No hay pedidos para mostrar.</Typography>
        ) : (
          <Grid container spacing={3}>
            {filtered.map(o => (
              <Grid item xs={12} md={6} key={o.orderId}>
                <Card sx={{
                  background: 'rgba(255,255,255,0.85)',
                  borderRadius: 3
                }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ReceiptLong color="primary" />
                        <Typography variant="h6">Pedido #{o.orderId}</Typography>
                      </Stack>
                      <StatusChip status={o.status} selected />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">Fecha: {o.orderDate ? new Date(o.orderDate).toLocaleString() : '-'}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>Total: ${o.totalAmount ?? 0}</Typography>

                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" gutterBottom>Detalles</Typography>
                    <Stack spacing={0.5}>
                      {(o.details || []).map((d, idx) => (
                        <Stack key={idx} direction="row" spacing={2} alignItems="center">
                          <Chip size="small" label={d.productName || `Producto ${d.productId}`} />
                          <Typography variant="body2">x{d.quantity}</Typography>
                          <Typography variant="body2">PU: ${d.unitPrice ?? 0}</Typography>
                        </Stack>
                      ))}
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

export default MyOrders;
