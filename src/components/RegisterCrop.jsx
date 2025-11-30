import React, { useState } from 'react';
import dataService from '../services/dataService';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Grid, TextField, Button, Alert } from '@mui/material';

const RegisterCrop = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    plantingDate: '',
    cultivatedArea: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);

  const { name, description, plantingDate, cultivatedArea } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterCrop = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccessful(false);
    setLoading(true);

    const cropData = {
        ...formData,
        cultivatedArea: parseFloat(cultivatedArea)
    };

    try {
      await dataService.registerCrop(cropData);
      setMessage('¡Cultivo registrado exitosamente!');
      setSuccessful(true);
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
          <Typography variant="h5" gutterBottom>Registrar Nuevo Cultivo</Typography>

          <form onSubmit={handleRegisterCrop}>
            {!successful ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="Nombre del Cultivo" name="name" value={name} onChange={onChange} required fullWidth />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField label="Fecha de Siembra" name="plantingDate" type="date" value={plantingDate} onChange={onChange} InputLabelProps={{ shrink: true }} required fullWidth />
                </Grid>

                <Grid item xs={12}>
                  <TextField label="Descripción" name="description" value={description} onChange={onChange} multiline rows={3} fullWidth />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField label="Área Cultivada (Hectáreas)" name="cultivatedArea" type="number" step="0.1" value={cultivatedArea} onChange={onChange} required fullWidth />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" disabled={loading} fullWidth>{loading ? 'Guardando...' : 'Registrar Cultivo'}</Button>
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

export default RegisterCrop;