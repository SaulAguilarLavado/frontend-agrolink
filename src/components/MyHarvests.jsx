import React, { useEffect, useState, useCallback } from 'react';
import dataService from '../services/dataService';
import { Container, Grid, Card, CardContent, Typography, Button, Stack, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton } from '@mui/material';
// router link not needed here
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const normalizeHarvests = (res) => {
  if (!res || !res.data) return [];
  let items = [];
  if (Array.isArray(res.data)) items = res.data;
  else if (Array.isArray(res.data.content)) items = res.data.content;
  else if (Array.isArray(res.data.harvests)) items = res.data.harvests;
  else {
    const arr = Object.values(res.data).find(v => Array.isArray(v));
    items = arr || [];
  }

  return items.map(h => ({
    id: h.id || h.harvestId || h._id || null,
    cropId: h.cropId || h.crop_id || (h.crop && (h.crop.id || h.crop.cropId)),
    cropName: (h.crop && (h.crop.name || h.crop.title)) || h.cropName || h.cultivo?.name || h.cultivoNombre || h.crop_name || '',
    // backend uses quantityHarvested in domain; handle many shapes
    quantity: h.quantity ?? h.qty ?? h.amount ?? h.quantityHarvested ?? 0,
    quality: h.quality || h.qualityNote || h.qualityNotes || '',
    harvestDate: h.harvestDate || h.date || h.createdAt || h.fechaCosecha || '',
    productId: h.productId || h.product_id || null,
    raw: h,
  }));
};

const MyHarvests = () => {
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Fill missing crop names by calling getCropById for unique cropIds
  const fillMissingCropNames = useCallback(async (harvestList) => {
    try {
      const ids = [...new Set(harvestList.filter(h => (!h.cropName || h.cropName === '') && h.cropId).map(h => h.cropId))];
      if (ids.length === 0) return;
      const promises = ids.map(id => dataService.getCropById(id).then(res => ({ id, name: res && res.data && (res.data.name || res.data.title) ? (res.data.name || res.data.title) : null })).catch(() => ({ id, name: null })));
      const results = await Promise.all(promises);
      const nameMap = {};
      results.forEach(r => { if (r && r.id) nameMap[r.id] = r.name; });
      if (Object.keys(nameMap).length > 0) {
        setHarvests(prev => prev.map(h => ({ ...h, cropName: h.cropName && h.cropName !== '' ? h.cropName : (nameMap[h.cropId] || h.cropName) })));
      }
    } catch (e) {
      console.debug('Error filling crop names:', e);
    }
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dataService.getMyHarvests();
      console.debug('getMyHarvests response:', res);
      const normalized = normalizeHarvests(res);
      setHarvests(normalized);
      // try to fill missing crop names
      fillMissingCropNames(normalized);
    } catch (e) {
      console.error(e);
      // Si el backend responde que GET no está soportado (405), usar fallback local
      const status = e && e.response && e.response.status;
      if (status === 405) {
        const local = JSON.parse(localStorage.getItem('localHarvests') || '[]');
        if (Array.isArray(local) && local.length > 0) {
          console.debug('Using local harvests fallback', local);
          // adapt local array to the same normalize format by wrapping
          const mappedLocal = local.map(h => ({
            id: h.id,
            cropId: h.cropId,
            cropName: h.cropName || (h.crop && (h.crop.name || h.crop.title)) || '',
            quantity: h.quantityHarvested ?? h.quantity ?? 0,
            quality: h.qualityNotes || h.quality || '',
            harvestDate: h.harvestDate || h.fechaCosecha || '',
            productId: h.productId || null,
            raw: h,
          }));
          setHarvests(mappedLocal);
          // attempt to fill any missing names from backend
          fillMissingCropNames(mappedLocal);
          setMessage({ type: 'info', text: 'El backend no expone endpoint GET para cosechas; mostrando cosechas registradas localmente.' });
        } else {
          setMessage({ type: 'warning', text: 'El backend no soporta obtener cosechas y no hay registros locales.' });
        }
      } else if (status === 401 || status === 403) {
        setMessage({ type: 'error', text: 'No autorizado para ver cosechas (inicia sesión).' });
      } else {
        // fallback: try local storage before failing
        const local = JSON.parse(localStorage.getItem('localHarvests') || '[]');
        if (Array.isArray(local) && local.length > 0) {
          const mappedLocal = local.map(h => ({
            id: h.id,
            cropId: h.cropId,
            cropName: h.cropName || (h.crop && (h.crop.name || h.crop.title)) || '',
            quantity: h.quantityHarvested ?? h.quantity ?? 0,
            quality: h.qualityNotes || h.quality || '',
            harvestDate: h.harvestDate || h.fechaCosecha || '',
            productId: h.productId || null,
            raw: h,
          }));
          setHarvests(mappedLocal);
          // try fill names
          fillMissingCropNames(mappedLocal);
          setMessage({ type: 'info', text: 'No fue posible cargar desde el servidor; mostrando registros locales.' });
        } else {
          setMessage({ type: 'error', text: 'Error al cargar cosechas' });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [fillMissingCropNames]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleOpenEdit = (h) => {
    setEditing({
      id: h.id,
      cropId: h.cropId,
      quantityHarvested: h.quantity,
      unitOfMeasure: h.raw && (h.raw.unitOfMeasure || h.raw.unidadMedida) ? (h.raw.unitOfMeasure || h.raw.unidadMedida) : 'kg',
      qualityNotes: h.quality,
      harvestDate: h.harvestDate ? h.harvestDate.split?.('T')?.[0] || h.harvestDate : '',
    });
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  const handleEditChange = (e) => setEditing({ ...editing, [e.target.name]: e.target.value });

  const handleSaveEdit = async () => {
    try {
      const payload = {
        cropId: editing.cropId,
        harvestDate: editing.harvestDate,
        quantityHarvested: parseFloat(editing.quantityHarvested),
        unitOfMeasure: editing.unitOfMeasure,
        qualityNotes: editing.qualityNotes,
      };
      await dataService.updateHarvest(editing.id, payload);
      // update local state
      setHarvests(harvests.map(h => h.id === editing.id ? { ...h, quantity: payload.quantityHarvested, quality: payload.qualityNotes, harvestDate: payload.harvestDate } : h));
      setMessage({ type: 'success', text: 'Cosecha actualizada' });
      handleCloseEdit();
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error al actualizar cosecha' });
    }
  };

  const handleDelete = async (h) => {
    if (!window.confirm('Confirmar eliminación de la cosecha?')) return;
    try {
      await dataService.deleteHarvest(h.id);
      setHarvests(harvests.filter(x => x.id !== h.id));
      setMessage({ type: 'success', text: 'Cosecha eliminada' });
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error al eliminar cosecha' });
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>Mis Cosechas</Typography>

      {loading ? (
        <Typography>Cargando...</Typography>
      ) : harvests.length === 0 ? (
        <Typography>No hay cosechas registradas.</Typography>
      ) : (
        <Grid container spacing={2}>
          {harvests.map(h => (
            <Grid item xs={12} md={6} key={h.id || Math.random()}>
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6">Cosecha #{h.id || '—'}</Typography>
                    <Typography variant="body2">Cultivo: {h.cropName && h.cropName !== '' ? h.cropName : (h.cropId || '—')}</Typography>
                    <Typography variant="body2">Cantidad: {h.quantity}</Typography>
                    <Typography variant="body2">Calidad: {h.quality || '-'}</Typography>
                    <Typography variant="body2">Fecha: {h.harvestDate ? h.harvestDate.split?.('T')?.[0] || h.harvestDate : '-'}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <IconButton size="small" onClick={() => handleOpenEdit(h)} aria-label="editar"><EditIcon fontSize="small"/></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(h)} aria-label="eliminar"><DeleteIcon fontSize="small"/></IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth>
        <DialogTitle>Editar Cosecha</DialogTitle>
        <DialogContent>
          {editing && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Cantidad" name="quantityHarvested" value={editing.quantityHarvested} onChange={handleEditChange} type="number" fullWidth />
              <TextField label="Unidad" name="unitOfMeasure" value={editing.unitOfMeasure} onChange={handleEditChange} fullWidth />
              <TextField select label="Calidad" name="qualityNotes" value={editing.qualityNotes} onChange={handleEditChange} fullWidth>
                <MenuItem value="BAJA">BAJA</MenuItem>
                <MenuItem value="MEDIA">MEDIA</MenuItem>
                <MenuItem value="ALTA">ALTA</MenuItem>
              </TextField>
              <TextField label="Fecha de cosecha" name="harvestDate" value={editing.harvestDate} onChange={handleEditChange} type="date" InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
        {message && <Alert severity={message.type} onClose={() => setMessage(null)}>{message.text}</Alert>}
      </Snackbar>
    </Container>
  );
};

export default MyHarvests;
