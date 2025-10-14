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
    <div className="form-container">
      <h2>Registrar Nuevo Cultivo</h2>
      <form onSubmit={handleRegisterCrop}>
        {!successful ? (
          <div>
            <div className="form-group">
              <label htmlFor="name">Nombre del Cultivo</label>
              <input type="text" name="name" value={name} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea name="description" value={description} onChange={onChange}></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="plantingDate">Fecha de Siembra</label>
              <input type="date" name="plantingDate" value={plantingDate} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="cultivatedArea">Área Cultivada (Hectáreas)</label>
              <input type="number" step="0.1" name="cultivatedArea" value={cultivatedArea} onChange={onChange} required />
            </div>
            <div className="form-group">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Registrar Cultivo'}
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

export default RegisterCrop;