import React, { useEffect, useState, useCallback } from 'react';
import dataService from '../services/dataService';
import { Container, Grid, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Snackbar, Alert } from '@mui/material';

const Inventory = (props) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('adjustment');
  const [message, setMessage] = useState(null);

  const mine = !!(props && props.mine);

  const fetchProducts = useCallback(async () => {
    try {
      const res = mine ? await dataService.getMyInventory() : await dataService.getAllProducts();
      console.debug('getAllProducts response:', res);

      // Normalize response shapes from backend (array or wrapper objects)
      let items = [];
      if (!res || !res.data) {
        items = [];
      } else if (Array.isArray(res.data)) {
        items = res.data;
      } else if (Array.isArray(res.data.content)) {
        items = res.data.content;
      } else if (Array.isArray(res.data.products)) {
        items = res.data.products;
      } else if (Array.isArray(res.data.data)) {
        items = res.data.data;
      } else {
        // if it's an object with keys, try to extract array-like values
        const values = Object.values(res.data).find(v => Array.isArray(v));
        items = values || [];
      }

      // Normalize product id / stock field names so UI can use consistent keys
      const normalized = items.map((p) => ({
        productId: p.productId || p.id || p.product_id || p._id || null,
        name: p.name || p.title || 'Sin nombre',
        pricePerUnit: p.pricePerUnit ?? p.price ?? p.unitPrice ?? 0,
        stock: p.availableStock ?? p.stock ?? p.quantity ?? 0,
        description: p.description || '',
        farmer: p.farmer || p.owner || {},
        raw: p,
      }));

      setProducts(normalized);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error al cargar productos' });
    } finally {
      setLoading(false);
    }
  }, [mine]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleOpen = (product) => {
    setSelected(product);
    setDelta('');
    setReason('adjustment');
    setOpen(true);
  };

  const handleDeleteProduct = async (product) => {
    if (!product || !product.productId) return;
    const ok = window.confirm(`¿Eliminar producto "${product.name}" (ID: ${product.productId})? Esta acción no se puede deshacer.`);
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
    if (isNaN(parsed) || parsed === 0) {
      setMessage({ type: 'error', text: 'Ingrese una cantidad válida (positiva o negativa).' });
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
      <Typography variant="h5" gutterBottom>Inventario</Typography>
      {loading ? (
        <Typography>Cargando...</Typography>
      ) : (
        <Grid container spacing={2}>
          {products.map(p => (
            <Grid item xs={12} md={4} key={p.productId}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{p.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Precio: ${p.pricePerUnit}</Typography>
                  <Typography variant="body2" color="text.secondary">Stock: {p.stock}</Typography>
                  <Button sx={{ mt: 2, mr: 1 }} variant="outlined" onClick={() => handleOpen(p)}>Ajustar stock</Button>
                  <Button sx={{ mt: 2 }} color="error" variant="contained" onClick={() => handleDeleteProduct(p)}>Borrar</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Ajustar stock - {selected?.name}</DialogTitle>
        <DialogContent>
          <TextField label="Cantidad (+ entrada, - salida)" value={delta} onChange={(e) => setDelta(e.target.value)} fullWidth sx={{ mt: 1 }} />
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
