import React, { useEffect, useState, useCallback } from 'react';
import dataService from '../services/dataService';
import { useLocation } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Snackbar, Alert, Box, Paper, Chip, Stack } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StorefrontIcon from '@mui/icons-material/Storefront';

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
      const raw = res?.data;
      // Extraer lista desde diversas envolturas, incluyendo niveles anidados
      const pickArray = (obj, depth = 0) => {
        if (!obj || depth > 3) return null;
        if (Array.isArray(obj)) return obj;
        if (typeof obj !== 'object') return null;
        const candidates = [
          obj.content,
          obj.items,
          obj.productos,
          obj.products,
          obj.result,
          obj.data,
          obj._embedded && (obj._embedded.productos || obj._embedded.products),
        ].filter(Boolean);
        for (const c of candidates) {
          const arr = pickArray(c, depth + 1);
          if (arr) return arr;
        }
        // Si no está en keys conocidas, buscar primera propiedad array
        for (const v of Object.values(obj)) {
          const arr = pickArray(v, depth + 1);
          if (arr) return arr;
        }
        return null;
      };

      let items = pickArray(raw) || [];

      const normalized = items.map((p) => ({
        productId: p.productId || p.id || p.productoId,
        name: p.name || p.nombre || 'Sin nombre',
        pricePerUnit: p.pricePerUnit ?? p.price ?? p.unitPrice ?? 0,
        stock: p.availableStock ?? p.stock ?? p.quantity ?? 0,
        unitOfMeasure: p.unitOfMeasure || p.unidad || 'unidad',
        description: p.description || p.descripcion || '',
        farmer: p.farmer || p.agricultor || {},
      }));

      // Si aún no hay items, intenta mostrar productos crudos como fallback al menos para depurar
      if (normalized.length === 0 && Array.isArray(raw)) {
        const alt = raw.map((p, idx) => ({
          productId: p.id || p.productId || idx,
          name: p.name || p.nombre || `Producto ${idx + 1}`,
          pricePerUnit: p.pricePerUnit ?? p.price ?? 0,
          stock: p.availableStock ?? p.stock ?? 0,
          unitOfMeasure: p.unitOfMeasure || p.unidad || 'unidad',
          description: p.description || p.descripcion || '',
          farmer: p.farmer || p.agricultor || {},
        }));
        setProducts(alt);
        return;
      }

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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Inventory2Icon sx={{ fontSize: 40, color: '#00f2fe' }} />
            {isMyInventory ? 'Mi Inventario' : 'Inventario General'}
          </Typography>
        </Paper>

        {loading ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <Typography>Cargando...</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {products.length === 0 ? (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
                  <Typography>No se encontraron productos.</Typography>
                </Paper>
              </Grid>
            ) : (
              products.map(p => (
                <Grid item xs={12} sm={6} md={4} key={p.productId}>
                  <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(79, 172, 254, 0.3)'
                    },
                    background: 'rgba(255,255,255,0.95)'
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#00f2fe', mb: 2 }}>
                        {p.name}
                      </Typography>
                      
                      <Stack spacing={1.5}>
                        <Chip 
                          icon={<LocalOfferIcon />}
                          label={`$${p.pricePerUnit} / ${p.unitOfMeasure}`}
                          color="success"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                        <Chip 
                          icon={<Inventory2Icon />}
                          label={`Stock: ${p.stock} ${p.unitOfMeasure}`}
                          color="primary"
                          size="small"
                        />
                      </Stack>

                      {isMyInventory && (
                        <Stack spacing={1} sx={{ mt: 3 }}>
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small" 
                            fullWidth
                            startIcon={<StorefrontIcon />}
                            onClick={() => window.alert('Funcionalidad de publicación próximamente')}
                          >
                            Poner a la venta
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            fullWidth
                            onClick={() => handleOpen(p)}
                            sx={{
                              borderColor: '#4facfe',
                              color: '#4facfe',
                              '&:hover': { borderColor: '#3a8cce', background: 'rgba(79, 172, 254, 0.1)' }
                            }}
                          >
                            Ajustar stock
                          </Button>
                          <Button 
                            color="error" 
                            variant="contained" 
                            size="small" 
                            fullWidth
                            onClick={() => handleDeleteProduct(p)}
                          >
                            Borrar
                          </Button>
                        </Stack>
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
    </Box>
  );
};

export default Inventory;