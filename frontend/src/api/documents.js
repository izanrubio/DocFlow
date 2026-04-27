import api from '../utils/api';

export const getDocuments  = (params, signal) => api.get('/documents', { params, signal });
export const getDocument   = (id) => api.get(`/documents/${id}`);
export const uploadDocument = (formData, onUploadProgress) =>
    api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
    });
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

export const addSigner    = (documentId, data) => api.post(`/documents/${documentId}/signers`, data);
export const removeSigner = (documentId, signerId) => api.delete(`/documents/${documentId}/signers/${signerId}`);
export const sendDocument     = (documentId) => api.post(`/documents/${documentId}/send`);
export const downloadDocument = (documentId) => api.get(`/documents/${documentId}/download`);
