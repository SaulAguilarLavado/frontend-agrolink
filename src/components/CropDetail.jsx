import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import dataService from '../services/dataService';
import { Container, Card, CardContent, Typography, Button, Stack, TextField, MenuItem, Snackbar, Alert } from '@mui/material';

const statusOptions = [
  { value: 'EN_CRECIMIENTO', label: 'En crecimiento' },
  { value: 'LISTO_PARA_COSECHA', label: 'Listo para cosecha' },
  { value: 'COSECHADO', label: 'Cosechado' },
];

const CropDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState(null);

  const fetchCrop = async () => {
    try {
      const res = await dataService.getCropById(id);
      setCrop(res.data);
      setStatus(res.data?.status || 'EN_CRECIMIENTO');
      setDate(res.data?.harvestDate ? res.data.harvestDate.split('T')[0] : '');
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'No se pudo cargar el cultivo' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCrop(); }, [id]);

  const handleUpdateStatus = async () => {
    try {
      await dataService.updateCropStatus(id, status);
      setMessage({ type: 'success', text: 'Estado actualizado' });
      await fetchCrop();
      if (status === 'COSECHADO') {
        // redirigir al formulario de registrar cosecha
        navigate(`/cultivos/${id}/register-harvest`);
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error al actualizar estado' });
    }
  };

  if (loading) return <Container sx={{ py: 4 }}><Typography>Cargando...</Typography></Container>;

  const getHarvestInfo = (c) => {
    if (!c) return { date: '', quantity: null, quality: '' };
    // Possible shapes: c.harvestDate, c.fechaCosecha, c.harvestedAt
    const date = c.harvestDate || c.fechaCosecha || c.harvestedAt || c.fecha || (c.cosecha && (c.cosecha.harvestDate || c.cosecha.fechaCosecha));
    const quantity = c.quantityHarvested ?? c.quantity ?? c.harvestQuantity ?? c.cosecha?.quantityHarvested ?? c.cosecha?.quantity ?? null;
    const quality = c.qualityNotes || c.quality || c.calidad || c.cosecha?.qualityNotes || c.cosecha?.quality || '';
    return { date, quantity, quality };
  };

  return (
    <Container sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5">Cultivo: {crop?.name || '—'}</Typography>
          <Typography variant="body2" color="text.secondary">Estado actual: {crop?.status}</Typography>
          <Typography variant="body2" color="text.secondary">Fecha siembra: {crop?.plantingDate?.split('T')?.[0] || '-'}</Typography>
          {String(crop?.status || '').toUpperCase() === 'COSECHADO' ? (
            (() => {
              const info = getHarvestInfo(crop);
              return (
                <Stack spacing={1} sx={{ mt: 3 }}>
                  <Typography variant="body1">Fecha de cosecha: {info.date ? String(info.date).split?.('T')?.[0] || info.date : '-'}</Typography>
                  <Typography variant="body1">Cantidad cosechada: {info.quantity ?? '-'} </Typography>
                  <Typography variant="body1">Calidad: {info.quality || '-'}</Typography>
                </Stack>
              );
            })()
          ) : (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
              <TextField select label="Nuevo estado" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>

              <TextField label="Fecha (si aplica)" type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />

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
