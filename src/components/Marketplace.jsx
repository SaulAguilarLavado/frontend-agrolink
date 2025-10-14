import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import './Marketplace.css'; // estilos mínimos para el marketplace

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
    return <div className="container py-4">Cargando productos...</div>;
  }

  if (error) {
    return <div className="container py-4 text-danger">{error}</div>;
  }

  return (
    <div className="container py-4">
      <h1 className="mb-2">Mercado de Productos</h1>
      <p className="text-muted mb-4">Explora los productos frescos directamente de nuestros agricultores.</p>

      {products.length === 0 ? (
        <p>No hay productos disponibles en este momento.</p>
      ) : (
        <div className="row g-4">
          {products.map((product) => (
            <div key={product.productId} className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted small">{product.description}</p>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between mb-2 small text-muted">
                      <div><strong>Precio:</strong> ${product.pricePerUnit} / {product.unitOfMeasure}</div>
                      <div><strong>Stock:</strong> {product.availableStock} {product.unitOfMeasure}</div>
                    </div>
                    <div className="mb-2 small text-muted">Vendido por: {product.farmer.name} {product.farmer.lastname}</div>
                    <button className="btn btn-primary w-100">Contactar al Vendedor</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;