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
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-3">Crear Nuevo Producto</h2>

          <form onSubmit={handleCreateProduct}>
            {!successful ? (
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="name" className="form-label">Nombre del Producto</label>
                  <input className="form-control" type="text" name="name" value={name} onChange={onChange} required />
                </div>

                <div className="col-12">
                  <label htmlFor="description" className="form-label">Descripción</label>
                  <textarea className="form-control" rows={4} name="description" value={description} onChange={onChange}></textarea>
                </div>

                <div className="col-md-6">
                  <label htmlFor="pricePerUnit" className="form-label">Precio por Unidad</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input className="form-control" type="number" step="0.01" name="pricePerUnit" value={pricePerUnit} onChange={onChange} required />
                  </div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="unitOfMeasure" className="form-label">Unidad de Medida</label>
                  <select className="form-select" name="unitOfMeasure" value={unitOfMeasure} onChange={onChange} required>
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                    <option value="unidad">unidad</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="availableStock" className="form-label">Stock Disponible</label>
                  <input className="form-control" type="number" step="0.1" name="availableStock" value={availableStock} onChange={onChange} required />
                </div>

                <div className="col-12">
                  <button className="btn btn-primary" disabled={loading}>
                    {loading ? 'Guardando...' : 'Crear Producto'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <Link to="/dashboard" className="btn btn-outline-secondary">Volver al Dashboard</Link>
              </div>
            )}

            {message && (
              <div className="mt-3">
                <div className={successful ? 'alert alert-success' : 'alert alert-danger'} role="alert">
                  {message}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;