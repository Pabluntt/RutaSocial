/**
 * Route helper to construct navigation paths
 * Removes undefined VITE_BASE_URL and provides clean paths
 */

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

export const routes = {
  home: () => `${BASE_URL}/`,
  login: () => `${BASE_URL}/login`,
  perfil: () => `${BASE_URL}/perfil`,
  calendario: () => `${BASE_URL}/calendario`,
  historial: () => `${BASE_URL}/historial`,
  adminUsuarios: () => `${BASE_URL}/admin/usuarios`,
};

export const getRoutePath = (path: string) => {
  return `${BASE_URL}${path}`;
};
