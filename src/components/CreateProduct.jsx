import React, { useState } from 'react';
import dataService from '../services/dataService';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Grid, TextField, MenuItem, InputAdornment, Button, Alert } from '@mui/material';

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

  const { name, description, pricePerUnit, unitOfMeasure, availableStock } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccessful(false);
    setLoading(true);

    // Preparamos los datos para enviar (asegurándonos de que los números sean números)
    const productData = {
        ...formData,
        pricePerUnit: parseFloat(pricePerUnit),
        availableStock: parseFloat(availableStock)
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
    <Container sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Crear Nuevo Producto</Typography>

          <form onSubmit={handleCreateProduct}>
            {!successful ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Nombre del Producto" name="name" value={name} onChange={onChange} required fullWidth />
                </Grid>

                <Grid item xs={12}>
                  <TextField label="Descripción" name="description" value={description} onChange={onChange} multiline rows={4} fullWidth />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField label="Precio por Unidad" name="pricePerUnit" type="number" step="0.01" value={pricePerUnit} onChange={onChange} required fullWidth InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField select label="Unidad de Medida" name="unitOfMeasure" value={unitOfMeasure} onChange={onChange} fullWidth>
                    <MenuItem value="kg">kg</MenuItem>
                    <MenuItem value="lb">lb</MenuItem>
                    <MenuItem value="unidad">unidad</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField label="Stock Disponible" name="availableStock" type="number" step="0.1" value={availableStock} onChange={onChange} required fullWidth />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" disabled={loading}>{loading ? 'Guardando...' : 'Crear Producto'}</Button>
                </Grid>
              </Grid>
            ) : (
              <div>
                <Button component={RouterLink} to="/dashboard" variant="outlined">Volver al Dashboard</Button>
              </div>
            )}

            {message && (
              <div style={{ marginTop: 16 }}>
                <Alert severity={successful ? 'success' : 'error'}>{message}</Alert>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateProduct;