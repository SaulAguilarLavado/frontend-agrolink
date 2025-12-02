import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Stack, Select, MenuItem, Button, Alert, Chip } from '@mui/material';
import dataService from '../services/dataService';

const STATUS_OPTIONS = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'COMPLETADO', 'RECHAZADO'];

const StatusChip = ({ status }) => {
  const color = {
    PENDIENTE: 'default',
    CONFIRMADO: 'primary',
    ENVIADO: 'info',
    COMPLETADO: 'success',
    RECHAZADO: 'error',
  }[status] || 'default';
  return <Chip size="small" color={color} label={status} />;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataService.getAllOrdersAdmin();
      setOrders(res.data || []);
    } catch (e) {
      setError(e?.response?.data || e?.message || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChangeStatus = async (orderId, status) => {
    setSavingId(orderId);
    setFlash(null);
    try {
      await dataService.updateOrderStatus(orderId, status);
      setFlash({ type: 'success', text: `Estado actualizado a ${status}` });
      // update local state
      setOrders(prev => prev.map(o => (o.orderId === orderId ? { ...o, status } : o)));
    } catch (e) {
      setFlash({ type: 'error', text: e?.response?.data || e?.message || 'No se pudo actualizar estado' });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Gestión de Pedidos</Typography>
        <Button variant="outlined" onClick={load} disabled={loading}>Recargar</Button>
      </Stack>
      {flash && <Alert severity={flash.type} sx={{ mb: 2 }}>{flash.text}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Typography>Cargando...</Typography>
      ) : orders.length === 0 ? (
        <Typography>No hay pedidos.</Typography>
      ) : (
        <Grid container spacing={2}>
          {orders.map(o => (
            <Grid item xs={12} md={6} key={o.orderId}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Pedido #{o.orderId}</Typography>
                    <StatusChip status={o.status} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">Fecha: {o.orderDate ? new Date(o.orderDate).toLocaleString() : '-'}</Typography>
                  <Typography variant="body2">Comprador: {o?.buyer?.email || '-'}</Typography>
                  <Typography variant="body2">Total: ${o?.totalAmount ?? 0}</Typography>

                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                    <Select size="small" value={o.status} onChange={(e) => handleChangeStatus(o.orderId, e.target.value)} disabled={savingId === o.orderId}>
                      {STATUS_OPTIONS.map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                    </Select>
                    <Button size="small" onClick={() => handleChangeStatus(o.orderId, 'RECHAZADO')} disabled={savingId === o.orderId || o.status === 'RECHAZADO'}>Rechazar</Button>
                    <Button size="small" variant="contained" onClick={() => handleChangeStatus(o.orderId, 'CONFIRMADO')} disabled={savingId === o.orderId || o.status === 'CONFIRMADO'}>Confirmar</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminOrders;
