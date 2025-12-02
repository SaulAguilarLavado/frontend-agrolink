import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import { Container, Grid, Card, CardContent, Typography, Button, Stack, TextField, MenuItem, Box, Chip, CardActions, IconButton, Paper } from '@mui/material';
import { useCart } from '../context/CartContext';
import { toUserMessage } from '../utils/error';
import ErrorBanner from './common/ErrorBanner';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonIcon from '@mui/icons-material/Person';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useCart();
  const [quantities, setQuantities] = useState({});
  // Filtros RF8
  const [filters, setFilters] = useState({
    tipoCultivo: '', // mapeado a nombre en backend
    unidad: '',
    maxPrecio: '',
    minCantidad: '',
  });

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await dataService.getAllProducts();
      setProducts(response.data || []);
    } catch (err) {
      setError(toUserMessage(err));
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        tipoCultivo: filters.tipoCultivo?.trim() || undefined,
        unidad: filters.unidad || undefined,
        maxPrecio: filters.maxPrecio !== '' ? Number(filters.maxPrecio) : undefined,
        minCantidad: filters.minCantidad !== '' ? Number(filters.minCantidad) : undefined,
      };
      const res = await dataService.filterProducts(params);
      setProducts(res.data || []);
    } catch (err) {
      setError(toUserMessage(err));
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setFilters({ tipoCultivo: '', unidad: '', maxPrecio: '', minCantidad: '' });
    await loadAll();
  };

  const setQty = (productId, val) => {
    setQuantities((prev) => ({ ...prev, [productId]: val }));
  };

  if (loading) {
    return <Container sx={{ py: 4 }}>Cargando productos...</Container>;
  }

  // No retornamos temprano para poder mostrar filtros + banner; mostramos banner arriba

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            🌾 Mercado de Productos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explora los productos frescos directamente de nuestros agricultores.
          </Typography>
        </Paper>

        <ErrorBanner message={error} onRetry={!loading ? loadAll : undefined} />

        {/* Controles de filtro RF8 */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
            🔍 Filtrar Productos
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Tipo de cultivo / Nombre"
                name="tipoCultivo"
                value={filters.tipoCultivo}
                onChange={handleFilterChange}
                fullWidth
                placeholder="Ej. papa, maíz"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                label="Unidad"
                name="unidad"
                value={filters.unidad}
                onChange={handleFilterChange}
                fullWidth
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="lb">lb</MenuItem>
                <MenuItem value="unidad">unidad</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                label="Precio máx."
                name="maxPrecio"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                value={filters.maxPrecio}
                onChange={handleFilterChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                label="Cantidad mín."
                name="minCantidad"
                type="number"
                inputProps={{ step: '0.1', min: '0' }}
                value={filters.minCantidad}
                onChange={handleFilterChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={applyFilters} sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #633a8a 100%)',
                  }
                }}>
                  Filtrar
                </Button>
                <Button variant="outlined" onClick={clearFilters} sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5568d3',
                    background: 'rgba(102, 126, 234, 0.1)'
                  }
                }}>
                  Limpiar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {(!error && products.length === 0) ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <Typography variant="h6" color="text.secondary">
              No hay productos disponibles en este momento.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {products.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.productId}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)'
                  },
                  background: 'rgba(255,255,255,0.95)'
                }}>
                  {(p.imageUrl || p.imagenUrl || p.imagen_url || p.imagen) && (
                    <Box
                      component="img"
                      src={p.imageUrl || p.imagenUrl || p.imagen_url || p.imagen}
                      alt={p.name}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                    <Typography variant="h5" gutterBottom sx={{ 
                      fontWeight: 'bold',
                      color: '#764ba2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      {p.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {p.description || 'Producto fresco de calidad'}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip 
                          icon={<LocalOfferIcon />}
                          label={`$${p.pricePerUnit} / ${p.unitOfMeasure}`}
                          color="success"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                        <Chip 
                          icon={<InventoryIcon />}
                          label={`${p.availableStock} ${p.unitOfMeasure}`}
                          color="primary"
                          size="small"
                        />
                      </Stack>
                      
                      <Chip 
                        icon={<PersonIcon />}
                        label={`${p?.farmer?.name} ${p?.farmer?.lastname}`}
                        variant="outlined"
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      <TextField
                        type="number"
                        size="small"
                        label="Cant."
                        inputProps={{ min: 1, step: '1' }}
                        value={quantities[p.productId] ?? 1}
                        onChange={(e) => setQty(p.productId, e.target.value)}
                        sx={{ width: 100 }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => addItem(p, Number(quantities[p.productId] ?? 1))}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontWeight: 'bold',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #633a8a 100%)',
                          }
                        }}
                      >
                        Añadir
                      </Button>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Marketplace;