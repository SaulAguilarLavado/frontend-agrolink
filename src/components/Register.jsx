import React, { useState } from 'react';
import authService from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    userType: 'agricultor',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);

  const { name, lastname, email, password, address, phone, userType } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccessful(false);
    setLoading(true);

    try {
      const response = await authService.register(formData);
      setMessage(response.data);
      setSuccessful(true);
    } catch (error) {
      const resMessage =
        (error.response && error.response.data) ||
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
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        {!successful && (
          <div>
            {/* ... aquí van todos los campos del formulario ... */}
            {/* (Nombre, Apellido, Email, etc.) */}
             <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input type="text" name="name" value={name} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="lastname">Apellido</label>
              <input type="text" name="lastname" value={lastname} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input type="email" name="email" value={email} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" name="password" value={password} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="address">Dirección</label>
              <input type="text" name="address" value={address} onChange={onChange} />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input type="text" name="phone" value={phone} onChange={onChange} />
            </div>
            <div className="form-group">
              <label htmlFor="userType">Tipo de Usuario</label>
              <select name="userType" value={userType} onChange={onChange}>
                <option value="agricultor">Agricultor</option>
                <option value="comprador">Comprador</option>
              </select>
            </div>
            <div className="form-group">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? 'Cargando...' : 'Registrarse'}
              </button>
            </div>
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

export default Register;