import React, { useEffect, useState } from 'react';
import dataService from '../services/dataService';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Grid, TextField, MenuItem, InputAdornment, Button, Alert, Box, Paper, Chip, Stack } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';

const CreateProduct = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerUnit: '',
    unitOfMeasure: 'kg', // Valor por defecto
    availableStock: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);
  const [errors, setErrors] = useState({ pricePerUnit: '', availableStock: '' });
  const [harvests, setHarvests] = useState([]);
  const [selectedHarvestId, setSelectedHarvestId] = useState('');

  const { name, description, pricePerUnit, unitOfMeasure, availableStock } = formData;

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validaciones en caliente para campos numéricos
    if (name === 'pricePerUnit') {
      const val = parseFloat(value);
      if (value === '') {
        setErrors((prev) => ({ ...prev, pricePerUnit: '' }));
      } else if (isNaN(val) || val <= 0) {
        setErrors((prev) => ({ ...prev, pricePerUnit: 'El precio debe ser mayor a 0' }));
      } else {
        setErrors((prev) => ({ ...prev, pricePerUnit: '' }));
      }
    }
    if (name === 'availableStock') {
      const val = parseFloat(value);
      if (value === '') {
        setErrors((prev) => ({ ...prev, availableStock: '' }));
      } else if (isNaN(val) || val < 0) {
        setErrors((prev) => ({ ...prev, availableStock: 'El stock no puede ser negativo' }));
      } else {
        setErrors((prev) => ({ ...prev, availableStock: '' }));
      }
    }
  };

  // Cargar cosechas del agricultor para sugerir creación de producto desde una cosecha
  useEffect(() => {
    const loadHarvests = async () => {
      try {
        const res = await dataService.getMyHarvests();
        const raw = res?.data;
        const list = Array.isArray(raw)
          ? raw
          : (raw?.content || raw?.items || raw?.cosechas || raw?.harvests || raw?.data || []);
        const norm = list.map((h) => ({
          id: h.id || h.harvestId || h.cosechaId,
          cropName: h.cropName || h.cultivoNombre || h.crop?.name || h.cultivo?.name || h.cultivo?.nombre,
          cropId: h.cropId || h.cultivoId || h.crop?.id || h.cultivo?.id,
          quantity: h.quantityHarvested ?? h.cantidad ?? h.quantity ?? 0,
          unit: h.unitOfMeasure || h.unidad || 'kg',
          date: h.harvestDate || h.fecha || h.date,
          raw: h,
        }));
        // Enriquecer con nombre del cultivo si falta
        const enriched = await Promise.all(norm.map(async (h) => {
          if (!h.cropName && h.cropId) {
            try {
              const cr = await dataService.getCropById(h.cropId);
              const cd = cr?.data || {};
              return { ...h, cropName: cd.name || cd.nombre || cd.title || `Cultivo ${h.cropId}` };
            } catch {
              return { ...h, cropName: `Cultivo ${h.cropId}` };
            }
          }
          return h;
        }));
        setHarvests(enriched);
      } catch (e) {
        // no-op, dejamos la lista vacía
      }
    };
    loadHarvests();
  }, []);

  const onSelectHarvest = (e) => {
    const val = e.target.value;
    setSelectedHarvestId(val);
    const sel = harvests.find((h) => String(h.id) === String(val));
    if (sel) {
      setFormData((f) => ({
        ...f,
        name: sel.cropName || f.name,
        unitOfMeasure: sel.unit || f.unitOfMeasure,
        availableStock: String(sel.quantity ?? f.availableStock),
      }));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccessful(false);
    setLoading(true);

    // Validación previa al envío
    const price = parseFloat(pricePerUnit);
    const stock = parseFloat(availableStock);
    if (isNaN(price) || price <= 0) {
      setErrors((prev) => ({ ...prev, pricePerUnit: 'El precio debe ser mayor a 0' }));
      setLoading(false);
      return;
    }
    if (isNaN(stock) || stock < 0) {
      setErrors((prev) => ({ ...prev, availableStock: 'El stock no puede ser negativo' }));
      setLoading(false);
      return;
    }

    // Preparamos los datos para enviar (asegurándonos de que los números sean números)
    const productData = {
      ...formData,
      pricePerUnit: price,
      availableStock: stock,
      ...(selectedHarvestId ? { harvestId: selectedHarvestId } : {})
    };

    try {
      await dataService.createProduct(productData);
      setMessage('¡Producto creado exitosamente!');
      setSuccessful(true);
        // Redirect to inventory so user can see the created product
        setTimeout(() => navigate('/inventory'), 800);
    } catch (error) {
      const resMessage =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage(resMessage);
      setSuccessful(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <AddBoxIcon sx={{ fontSize: 40, color: '#764ba2' }} />
            Crear Nuevo Producto
          </Typography>
        </Paper>

        <Card sx={{ borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <CardContent sx={{ p: 4 }}>

          <form onSubmit={handleCreateProduct}>
            {!successful ? (
              <Grid container spacing={2}>
                {harvests.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Crear desde cosecha"
                      value={selectedHarvestId}
                      onChange={onSelectHarvest}
                      fullWidth
                      helperText="Selecciona una cosecha para autocompletar"
                    >
                      {harvests.map((h) => (
                        <MenuItem key={h.id} value={h.id}>
                          {h.cropName} — {h.quantity} {h.unit}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField label="Nombre del Producto" name="name" value={name} onChange={onChange} required fullWidth />
                </Grid>

                <Grid item xs={12}>
                  <TextField label="Descripción" name="description" value={description} onChange={onChange} multiline rows={4} fullWidth />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Precio por Unidad" 
                    name="pricePerUnit" 
                    type="number" 
                    step="0.01" 
                    value={pricePerUnit} 
                    onChange={onChange} 
                    required 
                    error={!!errors.pricePerUnit}
                    helperText={errors.pricePerUnit}
                    fullWidth 
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField select label="Unidad de Medida" name="unitOfMeasure" value={unitOfMeasure} onChange={onChange} fullWidth>
                    <MenuItem value="kg">kg</MenuItem>
                    <MenuItem value="lb">lb</MenuItem>
                    <MenuItem value="unidad">unidad</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Stock Disponible" 
                    name="availableStock" 
                    type="number" 
                    step="0.1" 
                    value={availableStock} 
                    onChange={onChange} 
                    required 
                    error={!!errors.availableStock}
                    helperText={errors.availableStock}
                    fullWidth 
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large"
                    fullWidth
                    disabled={loading || !!errors.pricePerUnit || !!errors.availableStock}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 'bold',
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #633a8a 100%)',
                      }
                    }}
                  >
                    {loading ? 'Guardando...' : 'Crear Producto'}
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Button 
                  component={RouterLink} 
                  to="/dashboard" 
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #633a8a 100%)',
                    }
                  }}
                >
                  Volver al Dashboard
                </Button>
              </Box>
            )}

            {message && (
              <Box sx={{ mt: 3 }}>
                <Alert severity={successful ? 'success' : 'error'}>{message}</Alert>
              </Box>
            )}
          </form>
        </CardContent>
      </Card>
    </Container>
    </Box>
  );
};

export default CreateProduct;