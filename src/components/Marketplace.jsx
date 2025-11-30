import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import { Container, Grid, Card, CardContent, Typography, Button, Stack } from '@mui/material';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await dataService.getAllProducts();
        setProducts(response.data);
      } catch (err) {
        setError('Error al cargar los productos. Por favor, intenta de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <Container sx={{ py: 4 }}>Cargando productos...</Container>;
  }

  if (error) {
    return <Container sx={{ py: 4 }}><Typography color="error">{error}</Typography></Container>;
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Mercado de Productos</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>Explora los productos frescos directamente de nuestros agricultores.</Typography>

      {products.length === 0 ? (
        <Typography>No hay productos disponibles en este momento.</Typography>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} md={4} key={product.productId}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>{product.description}</Typography>
                  <div>
                    <Stack direction="row" justifyContent="space-between" sx={{ my: 1 }}>
                      <div><strong>Precio:</strong> ${product.pricePerUnit} / {product.unitOfMeasure}</div>
                      <div><strong>Stock:</strong> {product.availableStock} {product.unitOfMeasure}</div>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">Vendido por: {product.farmer.name} {product.farmer.lastname}</Typography>
                    <Button variant="contained" fullWidth sx={{ mt: 2 }}>Contactar al Vendedor</Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Marketplace;