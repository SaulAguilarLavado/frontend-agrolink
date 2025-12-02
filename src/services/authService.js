import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // decode helper (used for real tokens)

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/auth/`;

const login = (email, password) => {
  // Soporte de cuentas demo locales (no tocan la API ni la base de datos)
  const demoAgricultor = email === 'demo@agricultor.test' && password === 'agro123';
  const demoComprador = email === 'demo@comprador.test' && password === 'compra123';

  if (demoAgricultor) {
    // Retornamos una respuesta con un token especial que identificaremos localmente
    return Promise.resolve({ data: { accessToken: 'demo:agricultor' } });
  }

  if (demoComprador) {
    return Promise.resolve({ data: { accessToken: 'demo:comprador' } });
  }

  // Comportamiento por defecto: llamar a la API real
  return axios.post(API_URL + 'login', { email, password });
};

const register = (userData) => {
  return axios.post(API_URL + 'register', userData);
};

const logout = () => {
  localStorage.removeItem('token');
};

// --- FUNCIÓN NUEVA Y MUY IMPORTANTE ---
const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  // Tokens demo especiales (no son JWT reales)
  if (typeof token === 'string' && token.startsWith('demo:')) {
    const kind = token.split(':')[1];
    if (kind === 'agricultor') {
      return { email: 'demo@agricultor.test', roles: ['ROLE_AGRICULTOR'], name: 'Demo', lastname: 'Agricultor' };
    }
    if (kind === 'comprador') {
      return { email: 'demo@comprador.test', roles: ['ROLE_COMPRADOR'], name: 'Demo', lastname: 'Comprador' };
    }
  }

  // Para tokens reales, aprovechamos jwt-decode
  try {
    const decodedToken = jwtDecode(token);
    return {
      email: decodedToken.sub,
      roles: decodedToken.roles,
      name: decodedToken.name || decodedToken.given_name || null,
      lastname: decodedToken.lastname || decodedToken.family_name || null,
    };
  } catch (err) {
    // Si no se puede decodificar, devolvemos null
    return null;
  }
};
// ------------------------------------

const authService = {
  register,
  login,
  logout,
  getCurrentUser, // <-- EXPORTAR LA NUEVA FUNCIÓN
};

export default authService;