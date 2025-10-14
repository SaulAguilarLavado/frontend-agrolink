import React, { useState } from 'react';
import dataService from '../services/dataService';
import { Link } from 'react-router-dom';

const CreateProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerUnit: '',
    unitOfMeasure: 'kg', // Valor por defecto
    availableStock: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);

  const { name, description, pricePerUnit, unitOfMeasure, availableStock } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccessful(false);
    setLoading(true);

    // Preparamos los datos para enviar (asegurándonos de que los números sean números)
    const productData = {
        ...formData,
        pricePerUnit: parseFloat(pricePerUnit),
        availableStock: parseFloat(availableStock)
    };

    try {
      await dataService.createProduct(productData);
      setMessage('¡Producto creado exitosamente!');
      setSuccessful(true);
    } catch (error) {
      const resMessage =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage(resMessage);
      setSuccessful(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Crear Nuevo Producto</h2>
      <form onSubmit={handleCreateProduct}>
        {!successful ? (
          <div>
            <div className="form-group">
              <label htmlFor="name">Nombre del Producto</label>
              <input type="text" name="name" value={name} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea name="description" value={description} onChange={onChange}></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="pricePerUnit">Precio por Unidad</label>
              <input type="number" step="0.01" name="pricePerUnit" value={pricePerUnit} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="unitOfMeasure">Unidad de Medida</label>
              <input type="text" name="unitOfMeasure" value={unitOfMeasure} onChange={onChange} required />
            </div>
             <div className="form-group">
              <label htmlFor="availableStock">Stock Disponible</label>
              <input type="number" step="0.1" name="availableStock" value={availableStock} onChange={onChange} required />
            </div>
            <div className="form-group">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Crear Producto'}
              </button>
            </div>
          </div>
        ) : (
            <div>
                <Link to="/dashboard" className="btn-secondary">Volver al Dashboard</Link>
            </div>
        )}

        {message && (
          <div className="form-group">
            <div className={successful ? 'alert alert-success' : 'alert alert-danger'} role="alert">
              {message}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateProduct;