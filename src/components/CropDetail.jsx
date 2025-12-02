import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import dataService from '../services/dataService';
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  Snackbar,
  Alert,
  Grid,
  Avatar,
  Divider,
  Box,
  Paper
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const statusOptions = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Cosechado', label: 'Cosechado' },
];


const CropDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState(null);

  const fetchCrop = useCallback(async () => {
    try {
      const res = await dataService.getCropById(id);
      setCrop(res.data);
      setStatus(res.data?.status || 'Activo');
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'No se pudo cargar el cultivo' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCrop();
  }, [fetchCrop]);


  if (loading) return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="h6" color="text.secondary">Cargando...</Typography>
        </Paper>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="text"
            sx={{ mb: 2, color: '#11998e', fontWeight: 'bold' }}
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
          <Card sx={{ boxShadow: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'success.main' }}><AgricultureIcon /></Avatar>}
              title={<Typography variant="h5" sx={{ fontWeight: 'bold', color: '#11998e' }}>{crop?.name || '—'}</Typography>}
              subheader={<Typography variant="subtitle1" sx={{ color: '#38ef7d', fontWeight: 'bold' }}>{`Estado: ${crop?.status}`}</Typography>}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Fecha de siembra:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{crop?.plantingDate?.split('T')?.[0] || '-'}</Typography>
                  <Typography variant="body2" color="text.secondary">Extensión del terreno:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{crop?.area || '—'} ha</Typography>
                  <Typography variant="body2" color="text.secondary">Cuidados:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{crop?.care || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  {String(crop?.status || '').toUpperCase() === 'COSECHADO' ? (
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">Fecha de cosecha:</Typography>
                      <Typography variant="body1">{crop.harvestDate ? String(crop.harvestDate).split('T')[0] : 'No registrada'}</Typography>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Button component={RouterLink} to={`/cultivos/${id}/register-harvest`} variant="contained" sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', fontWeight: 'bold' }}>Registrar cosecha</Button>
                    </Stack>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
            {message && <Alert onClose={() => setMessage(null)} severity={message.type}>{message.text}</Alert>}
          </Snackbar>
        </Paper>
      </Container>
    </Box>
  );
};

export default CropDetail;