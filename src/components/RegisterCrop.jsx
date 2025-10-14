import React, { useState } from 'react';
import dataService from '../services/dataService';
import { Link } from 'react-router-dom';

const RegisterCrop = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    plantingDate: '',
    cultivatedArea: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);

  const { name, description, plantingDate, cultivatedArea } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterCrop = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccessful(false);
    setLoading(true);

    const cropData = {
        ...formData,
        cultivatedArea: parseFloat(cultivatedArea)
    };

    try {
      await dataService.registerCrop(cropData);
      setMessage('¡Cultivo registrado exitosamente!');
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
          <h2 className="card-title mb-3">Registrar Nuevo Cultivo</h2>

          <form onSubmit={handleRegisterCrop}>
            {!successful ? (
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">Nombre del Cultivo</label>
                  <input className="form-control" type="text" name="name" value={name} onChange={onChange} required />
                </div>

                <div className="col-md-6">
                  <label htmlFor="plantingDate" className="form-label">Fecha de Siembra</label>
                  <input className="form-control" type="date" name="plantingDate" value={plantingDate} onChange={onChange} required />
                </div>

                <div className="col-12">
                  <label htmlFor="description" className="form-label">Descripción</label>
                  <textarea className="form-control" rows={3} name="description" value={description} onChange={onChange}></textarea>
                </div>

                <div className="col-md-6">
                  <label htmlFor="cultivatedArea" className="form-label">Área Cultivada (Hectáreas)</label>
                  <input className="form-control" type="number" step="0.1" name="cultivatedArea" value={cultivatedArea} onChange={onChange} required />
                </div>

                <div className="col-12">
                  <button className="btn btn-primary" disabled={loading}>
                    {loading ? 'Guardando...' : 'Registrar Cultivo'}
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

export default RegisterCrop;