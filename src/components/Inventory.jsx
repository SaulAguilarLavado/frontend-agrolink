import React, { useEffect, useState, useCallback } from 'react';
import dataService from '../services/dataService';
import { useLocation } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Snackbar, Alert } from '@mui/material';

const Inventory = (props) => { // <-- Volvemos a recibir 'props'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('adjustment');
  const [message, setMessage] = useState(null);

  // --- LÓGICA CORREGIDA Y MEJORADA ---
  const location = useLocation();
  // 'isMyInventory' es true si la prop 'mine' es true, O si la URL incluye '/inventory'
  const isMyInventory = !!props.mine || location.pathname.includes('/inventory');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = isMyInventory ? await dataService.getMyInventory() : await dataService.getAllProducts();
      
      let items = res?.data && Array.isArray(res.data) ? res.data : [];

      const normalized = items.map((p) => ({
        productId: p.productId || p.id,
        name: p.name || 'Sin nombre',
        pricePerUnit: p.pricePerUnit ?? 0,
        stock: p.availableStock ?? 0,
        description: p.description || '',
        farmer: p.farmer || {},
      }));

      setProducts(normalized);
    } catch (e) {
      console.error('Error al cargar productos:', e);
      setMessage({ type: 'error', text: 'Error al cargar productos' });
    } finally {
      setLoading(false);
    }
  }, [isMyInventory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ... (El resto de las funciones handleOpen, handleDeleteProduct, etc., se quedan exactamente igual)
  const handleOpen = (product) => {
    setSelected(product);
    setDelta('');
    setReason('adjustment');
    setOpen(true);
  };

  const handleDeleteProduct = async (product) => {
    if (!product || !product.productId) return;
    const ok = window.confirm(`¿Eliminar producto "${product.name}"?`);
    if (!ok) return;
    try {
      await dataService.deleteProduct(product.productId);
      setMessage({ type: 'success', text: 'Producto eliminado' });
      await fetchProducts();
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error al eliminar producto' });
    }
  };

  const handleClose = () => setOpen(false);

  const handleAdjust = async () => {
    if (!selected) return;
    const parsed = parseFloat(delta);
    if (isNaN(parsed)) {
      setMessage({ type: 'error', text: 'Ingrese una cantidad válida.' });
      return;
    }

    try {
      await dataService.adjustProductStock(selected.productId, parsed, reason);
      setMessage({ type: 'success', text: 'Stock actualizado' });
      handleClose();
      await fetchProducts();
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error al actualizar stock' });
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      {/* El título ahora también usa la lógica correcta */}
      <Typography variant="h5" gutterBottom>{isMyInventory ? 'Mi Inventario' : 'Inventario General'}</Typography>
      {loading ? (
        <Typography>Cargando...</Typography>
      ) : (
        <Grid container spacing={2}>
          {products.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No se encontraron productos.</Typography>
            </Grid>
          ) : (
            products.map(p => (
              <Grid item xs={12} sm={6} md={4} key={p.productId}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary">Precio: ${p.pricePerUnit}</Typography>
                    <Typography variant="body2" color="text.secondary">Stock: {p.stock}</Typography>
                    {isMyInventory && (
                      <>
                        <Button sx={{ mt: 2, mr: 1 }} variant="outlined" onClick={() => handleOpen(p)}>Ajustar stock</Button>
                        <Button sx={{ mt: 2 }} color="error" variant="contained" onClick={() => handleDeleteProduct(p)}>Borrar</Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Ajustar stock - {selected?.name}</DialogTitle>
        <DialogContent>
          <TextField label="Cantidad (+ entrada, - salida)" value={delta} onChange={(e) => setDelta(e.target.value)} type="number" fullWidth sx={{ mt: 1 }} />
          <TextField select label="Motivo" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth sx={{ mt: 2 }}>
            <MenuItem value="sale">Venta</MenuItem>
            <MenuItem value="damage">Daño</MenuItem>
            <MenuItem value="adjustment">Ajuste manual</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleAdjust}>Aplicar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
        {message && <Alert onClose={() => setMessage(null)} severity={message.type} sx={{ width: '100%' }}>{message.text}</Alert>}
      </Snackbar>
    </Container>
  );
};

export default Inventory;