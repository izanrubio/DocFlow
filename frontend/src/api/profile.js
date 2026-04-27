import api from '../utils/api';

export const getProfile      = ()     => api.get('/profile');
export const updateProfile   = (data) => api.put('/profile', data);
export const updatePassword  = (data) => api.put('/profile/password', data);
