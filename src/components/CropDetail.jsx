import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import dataService from '../services/dataService';
import { Container, Card, CardContent, Typography, Button, Stack, TextField, MenuItem, Snackbar, Alert } from '@mui/material';

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

  const handleUpdateStatus = async () => {
    try {
      await dataService.updateCropStatus(id, status);
      setMessage({ type: 'success', text: 'Estado actualizado' });
      await fetchCrop();
      if (status === 'Cosechado') {
        navigate(`/cultivos/${id}/register-harvest`);
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error al actualizar estado' });
    }
  };

  if (loading) return <Container sx={{ py: 4 }}><Typography>Cargando...</Typography></Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5">Cultivo: {crop?.name || '—'}</Typography>
          <Typography variant="body2" color="text.secondary">Estado actual: {crop?.status}</Typography>
          <Typography variant="body2" color="text.secondary">Fecha siembra: {crop?.plantingDate?.split('T')?.[0] || '-'}</Typography>
          
          {String(crop?.status || '').toUpperCase() === 'COSECHADO' ? (
            <Stack spacing={1} sx={{ mt: 3 }}>
              <Typography variant="body1">Fecha de cosecha: {crop.harvestDate ? String(crop.harvestDate).split('T')[0] : 'No registrada'}</Typography>
            </Stack>
          ) : (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
              <TextField select label="Nuevo estado" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 200 }}>
                {statusOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
              <Button variant="contained" onClick={handleUpdateStatus}>Actualizar estado</Button>
              <Button component={RouterLink} to={`/cultivos/${id}/register-harvest`} variant="outlined">Registrar cosecha</Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
        {message && <Alert onClose={() => setMessage(null)} severity={message.type}>{message.text}</Alert>}
      </Snackbar>
    </Container>
  );
};

export default CropDetail;