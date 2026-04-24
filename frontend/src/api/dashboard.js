import api from '../utils/api';

export const getDashboardStats = () => api.get('/dashboard/stats');
