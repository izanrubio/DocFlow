import api from '../utils/api';

export const getDocuments = (params) => api.get('/documents', { params });
export const getDocument  = (id) => api.get(`/documents/${id}`);
export const uploadDocument = (formData, onUploadProgress) =>
    api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
    });
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
