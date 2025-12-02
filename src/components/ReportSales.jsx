import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Alert, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack, Box, Paper } from '@mui/material';
import dataService from '../services/dataService';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DownloadIcon from '@mui/icons-material/Download';

function exportCsv(rows) {
  const header = ['Transacción','Pedido','Fecha','Total','Comprador'];
  const lines = rows.map(r => [r.transactionId, r.orderId, r.transactionDate ? new Date(r.transactionDate).toISOString() : '', r.totalAmount, r.buyerName]);
  const csv = [header, ...lines].map(a => a.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reporte_ventas.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const ReportSales = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataService.getSalesReport();
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data || e?.message || 'Error al cargar reporte de ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const details = data?.detailedSales || [];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <AttachMoneyIcon sx={{ fontSize: 40, color: '#f5576c' }} />
              Reporte de Ventas
            </Typography>
            <Button 
              variant="contained" 
              onClick={load} 
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #d97de6 0%, #d44357 100%)' }
              }}
            >
              Recargar
            </Button>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
            <Typography>Cargando...</Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <ShoppingBagIcon sx={{ fontSize: 48, color: '#f5576c', mb: 1 }} />
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Total Ventas</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f5576c' }}>{data?.totalSalesCount ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <AttachMoneyIcon sx={{ fontSize: 48, color: '#38ef7d', mb: 1 }} />
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Ingresos Totales</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#38ef7d' }}>${data?.totalRevenue ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
              <Button 
                size="small" 
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => exportCsv(details)} 
                disabled={details.length === 0}
                sx={{
                  borderColor: '#f5576c',
                  color: '#f5576c',
                  '&:hover': { borderColor: '#d44357', background: 'rgba(245, 87, 108, 0.1)' }
                }}
              >
                Exportar CSV
              </Button>
            </Stack>
            <Card sx={{ borderRadius: 3, background: 'rgba(255,255,255,0.95)' }}>
              <CardContent>
                <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Transacción</TableCell>
                    <TableCell>Pedido</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Comprador</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.map((row) => (
                    <TableRow key={row.transactionId}>
                      <TableCell>{row.transactionId}</TableCell>
                      <TableCell>{row.orderId}</TableCell>
                      <TableCell>{row.transactionDate ? new Date(row.transactionDate).toLocaleString() : '-'}</TableCell>
                      <TableCell>${row.totalAmount ?? 0}</TableCell>
                      <TableCell>{row.buyerName || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
};

export default ReportSales;
