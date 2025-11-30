import React, { useState } from 'react';
import authService from '../services/authService';
import { Container, Grid, Card, CardContent, Typography, TextField, MenuItem, Button, Alert } from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    userType: 'agricultor',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);

  const { name, lastname, email, password, address, phone, userType } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccessful(false);
    setLoading(true);

    try {
      const response = await authService.register(formData);
      setMessage(response.data || 'Registro correcto');
      setSuccessful(true);
    } catch (error) {
      const resMessage =
        (error.response && error.response.data) ||
        error.message ||
        error.toString();
      setMessage(resMessage);
      setSuccessful(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <Card sx={{ width: '100%', maxWidth: 920, boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Grid container>
          <Grid item xs={12} md={6}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h5" gutterBottom>Crea tu cuenta</Typography>
              <Typography variant="body2" color="text.secondary">Regístrate para comenzar a publicar y conectar.</Typography>

              <form onSubmit={handleRegister}>
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <TextField label="Nombre" name="name" value={name} onChange={onChange} required fullWidth variant="outlined" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="Apellido" name="lastname" value={lastname} onChange={onChange} required fullWidth variant="outlined" />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField label="Correo Electrónico" name="email" value={email} onChange={onChange} required fullWidth variant="outlined" />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField label="Contraseña" type="password" name="password" value={password} onChange={onChange} required fullWidth variant="outlined" />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField label="Dirección" name="address" value={address} onChange={onChange} fullWidth variant="outlined" />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField label="Teléfono" name="phone" value={phone} onChange={onChange} fullWidth variant="outlined" />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField select label="Tipo de Usuario" name="userType" value={userType} onChange={onChange} fullWidth variant="outlined">
                      <MenuItem value="agricultor">Agricultor</MenuItem>
                      <MenuItem value="comprador">Comprador</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button type="submit" variant="contained" color="success" size="large" disabled={loading} fullWidth>{loading ? 'Cargando...' : 'Registrarse'}</Button>
                  </Grid>
                </Grid>
              </form>

              {message && (
                <div style={{ marginTop: 16 }}>
                  <Alert severity={successful ? 'success' : 'error'}>{message}</Alert>
                </div>
              )}
            </CardContent>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', backgroundColor: 'primary.main', color: 'white', p: 3 }}>
            <div style={{ textAlign: 'center' }}>
              <Typography variant="h6">Únete a la comunidad</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Publica productos, contacta compradores y gestiona tu producción desde un solo lugar.</Typography>
              <Button variant="outlined" color="inherit" sx={{ mt: 2 }}>Ver beneficios</Button>
            </div>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default Register;