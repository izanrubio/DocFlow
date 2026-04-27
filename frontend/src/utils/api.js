import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { toastBridge } from './toastBridge';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
    }

    if (status === 403 && error.response?.data?.message?.toLowerCase().includes('verif')) {
      window.location.href = '/verify-pending';
    }

    if (status === 429) {
      const retryAfter = error.response?.headers?.['retry-after']
        ?? error.response?.data?.retry_after;
      const base = 'Demasiadas peticiones. Por favor espera un momento antes de volver a intentarlo.';
      const msg  = retryAfter ? `${base} Podrás intentarlo de nuevo en ${retryAfter} segundos.` : base;
      toastBridge.error(msg, 7000);
    }

    return Promise.reject(error);
  }
);

export default api;
