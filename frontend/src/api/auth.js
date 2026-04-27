import api from '../utils/api';

export const register           = (data)       => api.post('/auth/register', data);
export const login              = (data)       => api.post('/auth/login', data);
export const me                 = ()           => api.get('/auth/me');
export const logout             = ()           => api.post('/auth/logout');
export const resendVerification = ()           => api.post('/auth/email/resend');
export const verifyEmailUrl     = (backendUrl) => api.get(backendUrl.replace(/^https?:\/\/[^/]+\/api/, ''));
