import axios from 'axios';

const API_URL = 'http://localhost:8080/auth/';

const login = (email, password) => {
  return axios.post(API_URL + 'login', {
    email,
    password,
  });
};

const register = (userData) => {
  return axios.post(API_URL + 'register', userData);
};

const logout = () => {
  localStorage.removeItem('token');
};

const authService = {
  register,
  login,
  logout,
};

export default authService;