import axios from 'axios';

const API_URL = 'http://localhost:8080/';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: 'Bearer ' + token };
  } else {
    return {};
  }
};

// --- FUNCIONES PARA PRODUCTOS ---

// (Función createProduct que ya tenías)
const createProduct = (productData) => {
  return axios.post(API_URL + 'productos', productData, { headers: getAuthHeader() });
};

// --- FUNCIÓN NUEVA PARA OBTENER PRODUCTOS ---
const getAllProducts = () => {
  // Hacemos un GET a /productos, enviando el encabezado de autorización
  return axios.get(API_URL + 'productos', { headers: getAuthHeader() });
};
// ------------------------------------------

// (Función registerCrop que ya tenías)
const registerCrop = (cropData) => {
  return axios.post(API_URL + 'cultivos', cropData, { headers: getAuthHeader() });
};


const dataService = {
  createProduct,
  getAllProducts, // <-- EXPORTAR LA NUEVA FUNCIÓN
  registerCrop,
};

export default dataService;