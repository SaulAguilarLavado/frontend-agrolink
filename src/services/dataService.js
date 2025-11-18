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

// --- NUEVAS FUNCIONES: RF4, RF5, RF6 ---

// Obtener un cultivo por id
const getCropById = (cropId) => {
  return axios.get(API_URL + `cultivos/${cropId}`, { headers: getAuthHeader() });
};

// Obtener cultivos del usuario (intenta varios endpoints como fallback)
const getMyCrops = async () => {
  // El backend actual expone GET /cultivos/my-crops
  const endpoints = [
    'cultivos/my-crops',
    'cultivos/my',
    'cultivos?mine=true',
    'cultivos',
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios.get(API_URL + ep, { headers: getAuthHeader() });
      // Si la respuesta parece contener una lista (array or wrapper), retornamos
      if (res && res.data) {
        return res;
      }
    } catch (err) {
      // Si 404/403 u otro, seguimos al siguiente endpoint
      // Pero si es 401, devolvemos el error para que el caller muestre mensaje de auth
      if (err.response && err.response.status === 401) throw err;
      // otherwise continue trying fallbacks
    }
  }

  // Si ninguno funcionó, hacemos el último intento que devolverá el último error (or empty)
  return axios.get(API_URL + 'cultivos', { headers: getAuthHeader() });
};

// Actualizar estado del cultivo
// Backend: PUT /cultivos/{id}/estado?estado=... (ver CropController.java)
const updateCropStatus = (cropId, status /*, date optional */) => {
  const url = API_URL + `cultivos/${cropId}/estado?estado=${encodeURIComponent(status)}`;
  // Controller espera PUT and request param 'estado'. No body required.
  return axios.put(url, null, { headers: getAuthHeader() });
};

// Registrar cosecha (POST /cosechas)
const registerHarvest = (harvestData) => {
  return axios.post(API_URL + 'cosechas', harvestData, { headers: getAuthHeader() });
};

// Obtener cosechas propias (intenta varios endpoints como fallback)
const getMyHarvests = async () => {
  const endpoints = [
    'cosechas/my-harvests',
    'cosechas/my',
    'cosechas?mine=true',
    'cosechas',
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios.get(API_URL + ep, { headers: getAuthHeader() });
      if (res && res.data) return res;
    } catch (err) {
      if (err.response && err.response.status === 401) throw err; // auth problem
      // continue to next fallback for 404/405 etc.
    }
  }

  // final attempt (will throw if fails)
  return axios.get(API_URL + 'cosechas', { headers: getAuthHeader() });
};

// Actualizar una cosecha (PUT /cosechas/{id})
const updateHarvest = (harvestId, payload) => {
  return axios.put(API_URL + `cosechas/${harvestId}`, payload, { headers: getAuthHeader() });
};

// Eliminar una cosecha (DELETE /cosechas/{id})
const deleteHarvest = (harvestId) => {
  return axios.delete(API_URL + `cosechas/${harvestId}`, { headers: getAuthHeader() });
};

// Obtener inventario propio del agricultor (fallbacks)
const getMyInventory = async () => {
  const endpoints = [
    'productos/mi-inventario',
    'productos/my-inventory',
    'productos/my',
    'productos',
  ];
  for (const ep of endpoints) {
    try {
      const res = await axios.get(API_URL + ep, { headers: getAuthHeader() });
      if (res && res.data) return res;
    } catch (err) {
      if (err.response && err.response.status === 401) throw err;
      // otherwise continue
    }
  }
  return axios.get(API_URL + 'productos', { headers: getAuthHeader() });
};

// Ajustar stock de producto (PATCH /productos/{id}/stock)
const adjustProductStock = (productId, delta, reason) => {
  const payload = { delta, reason };
  return axios.patch(API_URL + `productos/${productId}/stock`, payload, { headers: getAuthHeader() });
};

// Eliminar producto (DELETE /productos/{id})
const deleteProduct = (productId) => {
  return axios.delete(API_URL + `productos/${productId}`, { headers: getAuthHeader() });
};



const dataService = {
  createProduct,
  getAllProducts, // <-- EXPORTAR LA NUEVA FUNCIÓN
  registerCrop,
  // RF4 - RF6 helpers
  getCropById,
  updateCropStatus,
  registerHarvest,
  getMyHarvests,
  updateHarvest,
  deleteHarvest,
  getMyInventory,
  getMyCrops,
  adjustProductStock,
  deleteProduct,
};

export default dataService;