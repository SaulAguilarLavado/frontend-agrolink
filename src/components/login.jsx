import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      if (response.data && response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        navigate('/dashboard');
        window.location.reload();
      }
    } catch (error) {
      const resMessage =
        (error.response && error.response.data) ||
        error.message ||
        error.toString();
      setMessage(resMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg rounded-4 login-card">
        <div className="row g-0">
          <div className="col-md-5 d-none d-md-block card-left p-4 rounded-start-4">
            <div className="h-100 d-flex flex-column justify-content-center text-white">
              <h3 className="mb-3">Bienvenido a Agrolink</h3>
              <p className="small opacity-85">Conecta agricultores y compradores, gestiona cultivos y más.</p>
              <div className="mt-4">
                <button className="btn btn-outline-light btn-sm me-2">Saber más</button>
              </div>
            </div>
          </div>
          <div className="col-md-7 p-4">
            <div className="card-body">
              <h4 className="card-title mb-3">Iniciar Sesión</h4>
              <p className="text-muted small">Usa tu cuenta para acceder al panel</p>

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo Electrónico</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tucorreo@ejemplo.com"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <div className="input-group">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="remember" />
                    <label className="form-check-label small" htmlFor="remember">Recuérdame</label>
                  </div>
                  <Link to="/forgot-password" className="small">¿Olvidaste tu contraseña?</Link>
                </div>

                <div className="d-grid mb-3">
                  <button className="btn btn-primary btn-lg btn-gradient" type="submit" disabled={loading}>
                    {loading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                    Entrar
                  </button>
                </div>

                <div className="text-center mb-3">
                  <span className="small text-muted">o ingresa con</span>
                </div>

                <div className="d-flex gap-2 mb-3">
                  <button type="button" className="btn btn-outline-secondary w-100">Google</button>
                  <button type="button" className="btn btn-outline-secondary w-100">Facebook</button>
                </div>

                {message && (
                  <div className="alert alert-danger mt-2" role="alert">{message}</div>
                )}

                <div className="text-center mt-3">
                  <small>¿No tienes cuenta? <a href="/register">Regístrate</a></small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;