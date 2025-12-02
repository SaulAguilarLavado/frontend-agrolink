import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Alert, Table, TableHead, TableRow, TableCell, TableBody, Stack, LinearProgress, Box, Paper, Chip } from '@mui/material';
import dataService from '../services/dataService';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import PieChartIcon from '@mui/icons-material/PieChart';

const COLORS = {
  PENDIENTE: 'info.main',
  ACTIVO: 'primary.main',
  COSECHADO: 'success.main',
  CANCELADO: 'error.main',
};

const ReportCrops = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataService.getCropReport();
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data || e?.message || 'Error al cargar reporte de cultivos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const entries = Object.entries(data?.statusCounts || {});
  const total = data?.totalCropsCount || 0;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <AgricultureIcon sx={{ fontSize: 40, color: '#764ba2' }} />
              Reporte de Cultivos
            </Typography>
            <Chip 
              label={`Total: ${total}`}
              color="primary"
              sx={{ fontWeight: 'bold', fontSize: '1rem' }}
            />
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <Typography>Cargando...</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, background: 'rgba(255,255,255,0.95)', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AgricultureIcon sx={{ color: '#667eea' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Estados</Typography>
                  </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map(([status, count]) => (
                      <TableRow key={status}>
                        <TableCell>{status}</TableCell>
                        <TableCell align="right">{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3, background: 'rgba(255,255,255,0.95)', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PieChartIcon sx={{ color: '#764ba2' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Distribución</Typography>
                  </Box>
                {entries.length === 0 ? (
                  <Typography>No hay datos.</Typography>
                ) : entries.map(([status, count]) => {
                  const pct = total > 0 ? Math.round((count * 100) / total) : 0;
                  return (
                    <div key={status} style={{ marginBottom: 12 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">{status}</Typography>
                        <Typography variant="body2">{pct}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
                    </div>
                  );
                })}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ReportCrops;
