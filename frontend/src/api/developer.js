import api from '../utils/api';

export const getApiKeys    = ()              => api.get('/developer/keys');
export const createApiKey  = (data)          => api.post('/developer/keys', data);
export const updateApiKey  = (id, data)      => api.put(`/developer/keys/${id}`, data);
export const revokeApiKey  = (id)            => api.delete(`/developer/keys/${id}`);
