import api from '../utils/api';

// TODO: Sprint 2
export const getDocuments = () => api.get('/documents');
export const getDocument = (id) => api.get(`/documents/${id}`);
