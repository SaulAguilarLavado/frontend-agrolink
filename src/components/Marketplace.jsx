import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import './Marketplace.css'; // Crearemos este archivo para los estilos

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
  }, []); // El array vacío asegura que esto se ejecute solo una vez, al montar el componente

  if (loading) {
    return <div className="loading-container">Cargando productos...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="marketplace-container">
      <h1>Mercado de Productos</h1>
      <p>Explora los productos frescos directamente de nuestros agricultores.</p>
      
      {products.length === 0 ? (
        <p>No hay productos disponibles en este momento.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.productId} className="product-card">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-details">
                <span><strong>Precio:</strong> ${product.pricePerUnit} / {product.unitOfMeasure}</span>
                <span><strong>Stock:</strong> {product.availableStock} {product.unitOfMeasure}</span>
              </div>
              <div className="product-farmer">
                Vendido por: {product.farmer.name} {product.farmer.lastname}
              </div>
              <button className="btn-buy">Contactar al Vendedor</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;