import api from '../utils/api';

export const getTemplates    = ()           => api.get('/templates');
export const getTemplate     = (id)         => api.get(`/templates/${id}`);
export const createTemplate  = (formData)   => api.post('/templates', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateTemplate  = (id, data)   => api.put(`/templates/${id}`, data);
export const deleteTemplate  = (id)         => api.delete(`/templates/${id}`);
export const useTemplate     = (id, data)   => api.post(`/templates/${id}/use`, data);
