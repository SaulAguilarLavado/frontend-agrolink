import React, { useState } from 'react';
import dataService from '../services/dataService';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Grid, TextField, Button, Alert, Box, Paper, CardHeader, Avatar, Divider, InputAdornment, Snackbar } from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';

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
  const [snack, setSnack] = useState(null);

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
      setSnack({ type: 'success', text: 'Cultivo creado' });
    } catch (error) {
      const resMessage =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage(resMessage);
      setSuccessful(false);
      setSnack({ type: 'error', text: 'No se pudo registrar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 3, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AgricultureIcon sx={{ fontSize: 28, color: '#11998e' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#11998e' }}>Registrar Nuevo Cultivo</Typography>
        </Paper>

        <Card sx={{ borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'success.main' }}><AgricultureIcon /></Avatar>}
            title={<Typography variant="h6" sx={{ fontWeight: 'bold', color: '#11998e' }}>Detalles del Cultivo</Typography>}
            subheader={<Typography variant="body2" sx={{ color: 'text.secondary' }}>Completa la información para registrar</Typography>}
          />
          <Divider />
          <CardContent sx={{ p: 4 }}>

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
                  <TextField label="Descripción" name="description" value={description} onChange={onChange} multiline rows={3} fullWidth placeholder="Notas, cuidados, variedad, etc." />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Área Cultivada"
                    name="cultivatedArea"
                    type="number"
                    step="0.1"
                    value={cultivatedArea}
                    onChange={onChange}
                    required
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">ha</InputAdornment> }}
                    helperText="Ingresa el área en hectáreas"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={loading} 
                    fullWidth
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      fontWeight: 'bold',
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0e8077 0%, #2fd168 100%)',
                      }
                    }}
                  >
                    {loading ? 'Guardando...' : 'Registrar Cultivo'}
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/dashboard"
                    variant="text"
                    fullWidth
                    sx={{ mt: 1, color: '#11998e', fontWeight: 'bold' }}
                  >
                    Cancelar y volver
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Alert severity="success" sx={{ mb: 2 }}>¡Cultivo registrado exitosamente!</Alert>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <Button 
                      onClick={() => { setSuccessful(false); setFormData({ name: '', description: '', plantingDate: '', cultivatedArea: '' }); }}
                      fullWidth
                      variant="outlined"
                      sx={{ borderColor: '#11998e', color: '#11998e' }}
                    >
                      Registrar otro cultivo
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button 
                      component={RouterLink} 
                      to="/dashboard" 
                      fullWidth
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0e8077 0%, #2fd168 100%)',
                        }
                      }}
                    >
                      Volver al Dashboard
                    </Button>
                  </Grid>
                </Grid>
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
        <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack(null)}>
          {snack && <Alert onClose={() => setSnack(null)} severity={snack.type}>{snack.text}</Alert>}
        </Snackbar>
      </Container>
    </Box>
  );
};

export default RegisterCrop;