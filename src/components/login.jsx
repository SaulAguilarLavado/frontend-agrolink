import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, TextField, Button, Checkbox, FormControlLabel, Stack, CircularProgress, Alert } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      if (response.data && response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        navigate('/dashboard');
        window.location.reload();
      }
    } catch (error) {
      const resMessage =
        (error.response && error.response.data) ||
        error.message ||
        error.toString();
      setMessage(resMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Card sx={{ width: '100%', boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, backgroundColor: 'primary.main', color: 'white', p: 3, borderRadius: 1, alignItems: 'center' }}>
              <div>
                <Typography variant="h5" gutterBottom>Bienvenido a Agrolink</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Conecta agricultores y compradores, gestiona cultivos y más.</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button variant="outlined" color="inherit" size="small">Saber más</Button>
                </Stack>
              </div>
            </Grid>

            <Grid item xs={12} md={7}>
              <Typography variant="h5" gutterBottom>Iniciar Sesión</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>Usa tu cuenta para acceder al panel</Typography>

              <form onSubmit={handleLogin}>
                <Stack spacing={2}>
                  <TextField id="email" label="Correo Electrónico" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tucorreo@ejemplo.com" fullWidth />

                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField id="password" label="Contraseña" type={showPassword ? 'text' : 'password'} name="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" fullWidth />
                    <Button variant="outlined" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">{showPassword ? 'Ocultar' : 'Mostrar'}</Button>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <FormControlLabel control={<Checkbox />} label="Recuérdame" />
                    <RouterLink to="/forgot-password" style={{ textDecoration: 'none' }}><Typography variant="body2">¿Olvidaste tu contraseña?</Typography></RouterLink>
                  </Stack>

                  <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} startIcon={loading ? <CircularProgress size={18} /> : null}>
                    Entrar
                  </Button>

                  <Typography variant="body2" textAlign="center">o ingresa con</Typography>

                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" fullWidth>Google</Button>
                    <Button variant="outlined" fullWidth>Facebook</Button>
                  </Stack>

                  <Typography variant="body2" textAlign="center">O usa una cuenta de prueba</Typography>

                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" color="success" fullWidth size="small" onClick={async () => {
                      setLoading(true); setMessage('');
                      try {
                        const res = await authService.login('demo@agricultor.test','agro123');
                        if (res.data && res.data.accessToken) { localStorage.setItem('token', res.data.accessToken); navigate('/dashboard'); window.location.reload(); }
                      } catch (e) { setMessage('Demo login falló'); } finally { setLoading(false); }
                    }}>Demo Agricultor</Button>
                    <Button variant="contained" color="primary" fullWidth size="small" onClick={async () => {
                      setLoading(true); setMessage('');
                      try {
                        const res = await authService.login('demo@comprador.test','compra123');
                        if (res.data && res.data.accessToken) { localStorage.setItem('token', res.data.accessToken); navigate('/dashboard'); window.location.reload(); }
                      } catch (e) { setMessage('Demo login falló'); } finally { setLoading(false); }
                    }}>Demo Comprador</Button>
                  </Stack>

                  {message && (
                    <Alert severity="error">{message}</Alert>
                  )}

                  <Typography variant="body2" textAlign="center">¿No tienes cuenta? <a href="/register">Regístrate</a></Typography>
                </Stack>
              </form>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;