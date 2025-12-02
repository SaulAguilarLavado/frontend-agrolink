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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setMessage('Por favor selecciona un archivo de imagen válido');
        setSuccessful(false);
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('La imagen no debe superar los 5MB');
        setSuccessful(false);
        return;
      }
      
      setSelectedImage(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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
      // Primero crear el producto
      const response = await dataService.createProduct(productData);
      const createdProduct = response.data;
      const productId = createdProduct.id || createdProduct.productId;
      
      // Si hay imagen seleccionada, subirla
      if (selectedImage && productId) {
        setUploadingImage(true);
        try {
          console.log('📤 Subiendo imagen para producto ID:', productId);
          console.log('📁 Archivo:', selectedImage.name, 'Tipo:', selectedImage.type, 'Tamaño:', selectedImage.size);
          
          const imgResponse = await dataService.uploadProductImage(productId, selectedImage);
          
          console.log('✅ Respuesta completa:', imgResponse);
          console.log('✅ Datos del producto actualizado:', imgResponse.data);
          console.log('🖼️ URL de la imagen:', imgResponse.data?.imageUrl || imgResponse.data?.imagenUrl || imgResponse.data?.imagen_url);
          
          setMessage('¡Producto e imagen creados exitosamente!');
        } catch (imgError) {
          console.error('❌ Error al subir imagen:', imgError);
          console.error('📄 Response error:', imgError.response?.data);
          console.error('📄 Status:', imgError.response?.status);
          setMessage('Producto creado, pero hubo un error al subir la imagen: ' + (imgError.response?.data || imgError.message));
        } finally {
          setUploadingImage(false);
        }
      } else {
        setMessage('¡Producto creado exitosamente!');
      }
      
      setSuccessful(true);
      // Redirect to inventory so user can see the created product
      setTimeout(() => navigate('/inventory'), 1200);
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

                {/* Campo de carga de imagen */}
                <Grid item xs={12}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      border: '2px dashed #764ba2',
                      borderRadius: 2,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ color: '#764ba2', fontWeight: 600 }}>
                      Imagen del Producto
                    </Typography>
                    
                    {!imagePreview ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Selecciona una imagen para tu producto (máx. 5MB)
                        </Typography>
                        <Button
                          variant="outlined"
                          component="label"
                          sx={{ 
                            borderColor: '#764ba2',
                            color: '#764ba2',
                            '&:hover': {
                              borderColor: '#633a8a',
                              background: 'rgba(118, 75, 162, 0.08)'
                            }
                          }}
                        >
                          Seleccionar Imagen
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <Box
                          component="img"
                          src={imagePreview}
                          alt="Vista previa"
                          sx={{
                            maxWidth: '100%',
                            maxHeight: 300,
                            borderRadius: 2,
                            mb: 2,
                            boxShadow: 3
                          }}
                        />
                        <Stack direction="row" spacing={2} justifyContent="center">
                          <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            sx={{ 
                              borderColor: '#764ba2',
                              color: '#764ba2'
                            }}
                          >
                            Cambiar Imagen
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={removeImage}
                          >
                            Quitar Imagen
                          </Button>
                        </Stack>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large"
                    fullWidth
                    disabled={loading || uploadingImage || !!errors.pricePerUnit || !!errors.availableStock}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 'bold',
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #633a8a 100%)',
                      }
                    }}
                  >
                    {loading || uploadingImage ? 'Guardando...' : 'Crear Producto'}
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