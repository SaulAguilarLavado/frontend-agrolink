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
      setMessage(response.data || 'Registro correcto');
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
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-sm rounded-4 register-card p-3" style={{maxWidth: '900px'}}>
        <div className="row g-0">
          <div className="col-md-6 p-4">
            <h3 className="mb-3">Crea tu cuenta</h3>
            <p className="small text-muted">Regístrate para comenzar a publicar y conectar.</p>

            <form onSubmit={handleRegister}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre</label>
                  <input className="form-control" type="text" name="name" value={name} onChange={onChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Apellido</label>
                  <input className="form-control" type="text" name="lastname" value={lastname} onChange={onChange} required />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Correo Electrónico</label>
                <input className="form-control" type="email" name="email" value={email} onChange={onChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input className="form-control" type="password" name="password" value={password} onChange={onChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input className="form-control" type="text" name="address" value={address} onChange={onChange} />
              </div>

              <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input className="form-control" type="text" name="phone" value={phone} onChange={onChange} />
              </div>

              <div className="mb-3">
                <label className="form-label">Tipo de Usuario</label>
                <select className="form-select" name="userType" value={userType} onChange={onChange}>
                  <option value="agricultor">Agricultor</option>
                  <option value="comprador">Comprador</option>
                </select>
              </div>

              <div className="d-grid">
                <button className="btn btn-success btn-lg" disabled={loading}>
                  {loading ? 'Cargando...' : 'Registrarse'}
                </button>
              </div>
            </form>

            {message && (
              <div className={`alert mt-3 ${successful ? 'alert-success' : 'alert-danger'}`} role="alert">{message}</div>
            )}
          </div>

          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center card-right p-4 rounded-end-4">
            <div className="text-center text-white">
              <h4>Únete a la comunidad</h4>
              <p className="small opacity-85">Publica productos, contacta compradores y gestiona tu producción desde un solo lugar.</p>
              <div className="mt-3">
                <button className="btn btn-outline-light">Ver beneficios</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;