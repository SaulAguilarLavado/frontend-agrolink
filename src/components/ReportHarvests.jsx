import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Alert, Table, TableHead, TableRow, TableCell, TableBody, Stack, Box, Paper, Chip } from '@mui/material';
import dataService from '../services/dataService';
import GrassIcon from '@mui/icons-material/Grass';
import BarChartIcon from '@mui/icons-material/BarChart';

const ReportHarvests = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataService.getHarvestReport();
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data || e?.message || 'Error al cargar reporte de cosechas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totals = Object.entries(data?.totalQuantityByUnit || {});
  const details = data?.detailedHarvests || [];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <GrassIcon sx={{ fontSize: 40, color: '#11998e' }} />
              Reporte de Cosechas
            </Typography>
            <Chip 
              label={`Total: ${data?.totalHarvestsCount ?? 0}`}
              color="success"
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
                    <BarChartIcon sx={{ color: '#11998e' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Totales por unidad</Typography>
                  </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Unidad</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {totals.map(([unit, qty]) => (
                      <TableRow key={unit}>
                        <TableCell>{unit}</TableCell>
                        <TableCell align="right">{qty}</TableCell>
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
                    <GrassIcon sx={{ color: '#38ef7d' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Detalle de Cosechas</Typography>
                  </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Unidad</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>{h.id}</TableCell>
                        <TableCell>{h.harvestDate || '-'}</TableCell>
                        <TableCell>{h.quantityHarvested}</TableCell>
                        <TableCell>{h.unitOfMeasure}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ReportHarvests;
