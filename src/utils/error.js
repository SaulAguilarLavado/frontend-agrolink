// Utilities to normalize and present errors to the UI in Spanish

export function extractErrorInfo(err) {
  // Axios error shape
  const isAxios = !!(err && (err.isAxiosError || err.response || err.request));
  if (isAxios) {
    const status = err?.response?.status ?? null;
    const data = err?.response?.data;
    const serverMessage = typeof data === 'string' ? data : (data?.message || data?.error || null);
    const network = !!(err?.code === 'ECONNABORTED' || err?.message?.includes('Network Error') || (!err?.response && err?.request));
    return {
      type: 'axios',
      status,
      network,
      message: serverMessage || err?.message || 'Error inesperado',
      raw: err,
    };
  }

  // Generic JS error
  return {
    type: 'generic',
    status: null,
    network: false,
    message: err?.message || 'Error inesperado',
    raw: err,
  };
}

export function toUserMessage(err) {
  const info = extractErrorInfo(err);
  if (info.network) {
    return 'No hay conexión con el servidor. Verifica tu red e inténtalo de nuevo.';
  }
  if (info.status === 401) {
    return 'Tu sesión ha expirado o no tienes permisos. Ingresa nuevamente.';
  }
  if (info.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }
  if (info.status === 404) {
    return 'Recurso no encontrado.';
  }
  if (info.status === 409) {
    return info.message || 'Conflicto al procesar la solicitud.';
  }
  if (info.status >= 500) {
    return 'Ocurrió un problema en el servidor. Inténtalo más tarde.';
  }
  return info.message || 'Ocurrió un error. Inténtalo nuevamente.';
}
