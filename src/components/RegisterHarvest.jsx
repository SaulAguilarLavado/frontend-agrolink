import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dataService from '../services/dataService';
import { Container, Typography, TextField, Button, Grid, Snackbar, Alert, MenuItem, Box, Paper } from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';

const RegisterHarvest = () => {
  const { id } = useParams(); // crop id
  const navigate = useNavigate();
  const [form, setForm] = useState({ cropId: id || '', quantity: '', quality: 'MEDIA', harvestDate: '' , productId: '', unitOfMeasure: 'unidad' });
  const [message, setMessage] = useState(null);
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    if (id) setForm((f) => ({ ...f, cropId: id }));
  }, [id]);

  const [cropName, setCropName] = useState('');

  // Si viene id, obtener datos del cultivo para mostrar nombre y calcular cantidad
  useEffect(() => {
    const loadOne = async () => {
      if (!id) return;
      try {
        const res = await dataService.getCropById(id);
        const c = res && res.data ? res.data : null;
        if (c) {
          const name = c.name || c.nombre || c.title || 'Sin nombre';
          const area = c.cultivatedArea || c.areaCultivada || c.area || c.plantingArea || null;
          setCropName(name);
          // si tenemos area, calcular kg y poner como cantidad (kg)
          if (area != null && !isNaN(parseFloat(area))) {
            const hectares = parseFloat(area);
            const kg = hectares * 100;
            setForm(f => ({ ...f, quantity: String(kg), unitOfMeasure: 'kg' }));
          }
        }
      } catch (e) {
        console.error('Error loading crop', e);
      }
    };
    loadOne();
  }, [id]);

  // Si no viene id en la ruta, obtenemos la lista de cultivos del usuario
  useEffect(() => {
    const load = async () => {
      if (id) return;
      // setLoadingCrops(true);
      try {
        const res = await dataService.getMyCrops();
        const list = (res && res.data) ? (
          Array.isArray(res.data) ? res.data : (res.data.content || res.data.crops || Object.values(res.data).find(v => Array.isArray(v)) || [])
        ) : [];
        setCrops(list.map(c => ({
          id: c.id || c.cropId || c._id || null,
          name: c.name || c.title || c.nombre || 'Sin nombre',
          cultivatedArea: c.cultivatedArea || c.areaCultivada || c.area || null,
          raw: c,
        })));
      } catch (e) {
        console.error('Error loading crops list', e);
      } finally {
        // no-op
      }
    };
    load();
  }, [id]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      cropId: form.cropId,
      harvestDate: form.harvestDate,
      quantityHarvested: parseFloat(form.quantity),
      unitOfMeasure: form.unitOfMeasure || 'kg',
      qualityNotes: form.quality,
      productId: form.productId || null,
    };

    console.debug('Submitting harvest payload:', payload);

    if (!payload.cropId || isNaN(payload.quantityHarvested) || payload.quantityHarvested <= 0) {
      setMessage({ type: 'error', text: 'Verifique los campos requeridos y la cantidad.' });
      return;
    }

    try {
      const res = await dataService.registerHarvest(payload);
      // guardar copia local por si el backend no expone GET para cosechas
      try {
        const saved = res && res.data ? res.data : {
          id: Date.now(),
          cropId: payload.cropId,
          quantityHarvested: payload.quantityHarvested,
          unitOfMeasure: payload.unitOfMeasure,
          qualityNotes: payload.qualityNotes,
          harvestDate: payload.harvestDate,
          productId: payload.productId,
        };
        const existing = JSON.parse(localStorage.getItem('localHarvests') || '[]');
        existing.unshift(saved);
        localStorage.setItem('localHarvests', JSON.stringify(existing));
      } catch (e) {
        console.warn('Could not persist local harvest copy', e);
      }
      // Cambiar estado del cultivo a COSECHADO (RF4) después del registro
      try {
        if (payload.cropId) {
          await dataService.updateCropStatus(payload.cropId, 'Cosechado');
        }
      } catch (e) {
        console.warn('No se pudo actualizar el estado del cultivo a COSECHADO', e);
      }

      setMessage({ type: 'success', text: 'Cosecha registrada correctamente' });
      // opcional: redirigir al inventario
      setTimeout(() => navigate('/inventory'), 900);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error al registrar cosecha' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AgricultureIcon sx={{ fontSize: 32, color: '#11998e', mr: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#11998e' }}>Registrar Cosecha</Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {id ? (
                  <TextField label="Cultivo" value={cropName || form.cropId} fullWidth disabled helperText="Nombre del cultivo" />
                ) : (
                  <TextField select label="Selecciona Cultivo" name="cropId" value={form.cropId} onChange={(e)=>{
                      const val = e.target.value;
                      // encontrar cultivo y autocompletar cantidad (kg)
                      const sel = crops.find(c=>String(c.id)===String(val));
                      const hectares = sel?.cultivatedArea ? parseFloat(sel.cultivatedArea) : null;
                      const kg = hectares != null && !isNaN(hectares) ? hectares * 100 : null;
                      setForm(f=>({ ...f, cropId: val, quantity: kg != null ? String(kg) : f.quantity, unitOfMeasure: kg != null ? 'kg' : f.unitOfMeasure }));
                    }} fullWidth required>
                    {crops.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Cantidad" name="quantity" value={form.quantity} onChange={onChange} type="number" fullWidth required helperText={form.unitOfMeasure === 'unidad' ? 'Cantidad en unidades' : (form.unitOfMeasure === 'kg' ? `Cantidad en kg — ≈ ${ (parseFloat(form.quantity) * 5).toFixed(0) } unidades` : 'Cantidad en ' + form.unitOfMeasure)} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField select label="Calidad" name="quality" value={form.quality} onChange={onChange} fullWidth>
                  <MenuItem value="BAJA">BAJA</MenuItem>
                  <MenuItem value="MEDIA">MEDIA</MenuItem>
                  <MenuItem value="ALTA">ALTA</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Fecha de cosecha" name="harvestDate" value={form.harvestDate} onChange={onChange} type="date" InputLabelProps={{ shrink: true }} fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Unidad" name="unitOfMeasure" value={form.unitOfMeasure} onChange={onChange} fullWidth disabled />
              </Grid>

              <Grid item xs={12}>
                <TextField label="Producto asociado (opcional - productId)" name="productId" value={form.productId} onChange={onChange} fullWidth />
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" type="submit" fullWidth sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', fontWeight: 'bold', py: 1.5 }}>Registrar Cosecha</Button>
              </Grid>
            </Grid>
          </form>
          <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
            {message && <Alert onClose={() => setMessage(null)} severity={message.type}>{message.text}</Alert>}
          </Snackbar>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterHarvest;
