import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Grid, Card, CardContent, Typography, TextField, Button,
  Checkbox, FormControlLabel, Stack, CircularProgress, Alert, Box, Paper
} from '@mui/material';

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
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("/images/fondo-agrolink.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(6px)'
          }}
        >
          {/* Logo + Texto */}
          <Box textAlign="center" sx={{ mb: 3 }}>
            <img
              src="/images/logo-agrolink.png"
              alt="Agrolink"
              style={{ width: 160, marginBottom: 12 }}
            />
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Conecta agricultores y compradores de manera simple.
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
            Iniciar Sesión
          </Typography>

          <form onSubmit={handleLogin}>
            <Stack spacing={2}>

              <TextField
                label="Correo Electrónico"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  variant="outlined"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Button>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <FormControlLabel control={<Checkbox />} label="Recuérdame" />
                <RouterLink to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    ¿Olvidaste tu contraseña?
                  </Typography>
                </RouterLink>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                color="success"
                size="large"
                fullWidth
                sx={{ py: 1.5, fontSize: '1rem' }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : null}
              >
                Entrar
              </Button>

              <Typography variant="body2" textAlign="center">
                o ingresa con
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button fullWidth variant="outlined">Google</Button>
                <Button fullWidth variant="outlined">Facebook</Button>
              </Stack>

              <Typography variant="body2" textAlign="center">
                O usa una cuenta de prueba
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={async () => {
                    try {
                      const res = await authService.login('demo@agricultor.test', 'agro123');
                      if (res.data.accessToken) {
                        localStorage.setItem('token', res.data.accessToken);
                        navigate('/dashboard');
                        window.location.reload();
                      }
                    } catch {
                      setMessage('Demo Agricultor falló');
                    }
                  }}
                >
                  Demo Agricultor
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={async () => {
                    try {
                      const res = await authService.login('demo@comprador.test', 'compra123');
                      if (res.data.accessToken) {
                        localStorage.setItem('token', res.data.accessToken);
                        navigate('/dashboard');
                        window.location.reload();
                      }
                    } catch {
                      setMessage('Demo Comprador falló');
                    }
                  }}
                >
                  Demo Comprador
                </Button>
              </Stack>

              {message && <Alert severity="error">{message}</Alert>}

              <Typography textAlign="center" variant="body2">
                ¿No tienes cuenta? <a href="/register">Regístrate</a>
              </Typography>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
