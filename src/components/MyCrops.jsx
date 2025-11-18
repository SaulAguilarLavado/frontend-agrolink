import React, { useEffect, useState } from 'react';
import dataService from '../services/dataService';
import { Container, Grid, Card, CardContent, Typography, Button, Stack, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const formatElapsed = (fromDate, now) => {
  if (!fromDate) return '-';
  const start = new Date(fromDate);
  const diff = Math.max(0, Math.floor((now - start) / 1000)); // seconds
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  if (minutes || hours || days) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
};

const normalizeCrops = (res) => {
  if (!res || !res.data) return [];
  let items = [];
  if (Array.isArray(res.data)) items = res.data;
  else if (Array.isArray(res.data.content)) items = res.data.content;
  else if (Array.isArray(res.data.crops)) items = res.data.crops;
  else {
    const arr = Object.values(res.data).find(v => Array.isArray(v));
    items = arr || [];
  }

  return items.map(c => ({
    id: c.id || c.cropId || c._id || null,
    name: c.name || c.title || 'Sin nombre',
    plantingDate: c.plantingDate || c.createdAt || c.date || null,
    status: c.status || 'EN_CRECIMIENTO',
    raw: c,
  }));
};

const MyCrops = () => {
  const [crops, setCrops] = useState([]);
  const [now, setNow] = useState(new Date());
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  // map cropId -> stopTimestamp (ISO string or number)
  const [frozenTimes, setFrozenTimes] = useState({});
  const navigate = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await dataService.getMyCrops();
      console.debug('getMyCrops response:', res);
      const normalized = normalizeCrops(res);

      // build frozenTimes from server data when possible (fields that indicate harvest date)
      const serverFrozen = {};
      const persisted = JSON.parse(localStorage.getItem('cropFreezeTimes') || '{}');
      normalized.forEach(c => {
        const raw = c.raw || {};
        // common harvest date field names: harvestDate, fechaCosecha, harvestedAt, fechaCosecha
        const harvestDate = raw.harvestDate || raw.fechaCosecha || raw.harvestedAt || raw.fecha_cosecha || raw.fecha;
        if (c.status === 'COSECHADO' && harvestDate) {
          serverFrozen[c.id] = new Date(harvestDate).toISOString();
        } else if (persisted && persisted[c.id]) {
          // fallback to persisted local freeze timestamp
          serverFrozen[c.id] = persisted[c.id];
        }
      });

      // If server provides harvest dates, prefer them and remove persisted ones for those ids
      const cleanedPersist = { ...(JSON.parse(localStorage.getItem('cropFreezeTimes') || '{}')) };
      Object.keys(serverFrozen).forEach(id => { if (cleanedPersist[id]) delete cleanedPersist[id]; });
      // save cleaned persisted back
      localStorage.setItem('cropFreezeTimes', JSON.stringify(cleanedPersist));

      setCrops(normalized);
      setFrozenTimes(serverFrozen);
    } catch (e) {
      console.error(e);
      if (e.response && (e.response.status === 401 || e.response.status === 403)) {
        setMessage({ type: 'warning', text: 'No autorizado. Por favor inicia sesión (token inválido).' });
      } else {
        setMessage({ type: 'error', text: 'Error al cargar mis cultivos (revisa endpoint o token).' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  // Timer to update elapsed every second
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleHarvest = async (crop) => {
    try {
      await dataService.updateCropStatus(crop.id, 'COSECHADO');
      setMessage({ type: 'success', text: 'Cultivo marcado como cosechado' });
      // freeze timer locally at this moment so user sees elapsed stop exactly now
      const ts = new Date().toISOString();
      const newFrozen = { ...frozenTimes, [crop.id]: ts };
      setFrozenTimes(newFrozen);
      // update local UI status immediately
      setCrops(prev => prev.map(p => p.id === crop.id ? { ...p, status: 'COSECHADO' } : p));
      // persist locally until backend returns harvest date
      const persisted = JSON.parse(localStorage.getItem('cropFreezeTimes') || '{}');
      persisted[crop.id] = ts;
      localStorage.setItem('cropFreezeTimes', JSON.stringify(persisted));

      // redirect to register harvest to input quantity/quality
      setTimeout(() => navigate(`/cultivos/${crop.id}/register-harvest`), 800);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error al marcar cosecha' });
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>Mis Cultivos</Typography>

      {loading ? (
        <Typography>Cargando...</Typography>
      ) : crops.length === 0 ? (
        <>
          <Typography>No tienes cultivos registrados.</Typography>
          <Typography variant="caption" color="text.secondary">Si deberías ver cultivos, verifica que tu token está activo o que el backend expone un endpoint para "mis cultivos".</Typography>
          <Button sx={{ mt: 1 }} variant="outlined" onClick={fetch}>Reintentar</Button>
        </>
      ) : (
        <Grid container spacing={2}>
          {crops.map(c => (
            <Grid item xs={12} md={6} key={c.id || Math.random()}>
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6">{c.name}</Typography>
                    <Typography variant="body2">Estado: {c.status}</Typography>
                    <Typography variant="body2">Desde: {c.plantingDate ? new Date(c.plantingDate).toLocaleDateString() : '-'}</Typography>
                    <Typography variant="body2">Tiempo transcurrido: {formatElapsed(c.plantingDate, frozenTimes[c.id] ? new Date(frozenTimes[c.id]) : now)}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {String(c.status || '').toUpperCase() !== 'COSECHADO' && (
                        <Button variant="contained" color="success" onClick={() => handleHarvest(c)}>Cosechar</Button>
                      )}
                      {String(c.status || '').toUpperCase() !== 'COSECHADO' ? (
                        <Button variant="outlined" onClick={() => navigate(`/cultivos/${c.id}`)}>Ver detalle</Button>
                      ) : (
                        <Button variant="outlined" onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }}>Volver</Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
        {message && <Alert severity={message.type} onClose={() => setMessage(null)}>{message.text}</Alert>}
      </Snackbar>
    </Container>
  );
};

export default MyCrops;
