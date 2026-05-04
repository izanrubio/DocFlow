import api from '../utils/api';

export const joinWaitlist      = (data)  => api.post('/waitlist', data);
export const getWaitlistCount  = ()      => api.get('/waitlist/count');
export const getWaitlistAdmin  = (page)  => api.get(`/admin/waitlist?page=${page ?? 1}`);
export const getWaitlistStats  = ()      => api.get('/admin/waitlist/stats');
export const launchWaitlist    = ()      => api.post('/admin/waitlist/launch');
