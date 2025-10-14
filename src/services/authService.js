import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // <-- IMPORTAR LA LIBRERÍA

const API_URL = 'http://localhost:8080/auth/';

const login = (email, password) => {
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
  // Decodificamos el token para leer su contenido
  const decodedToken = jwtDecode(token);
  return {
    email: decodedToken.sub, // 'sub' es el campo estándar para el "subject" (nuestro email)
    roles: decodedToken.roles, // 'roles' es el campo personalizado que añadimos
  };
};
// ------------------------------------

const authService = {
  register,
  login,
  logout,
  getCurrentUser, // <-- EXPORTAR LA NUEVA FUNCIÓN
};

export default authService;