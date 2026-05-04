import api from '../utils/api';

export const getSuperAdminStats       = ()         => api.get('/superadmin/stats');
export const getSuperAdminTenants     = (params)   => api.get('/superadmin/tenants', { params });
export const getSuperAdminTenant      = (id)       => api.get(`/superadmin/tenants/${id}`);
export const changeTenantPlan         = (id, plan) => api.put(`/superadmin/tenants/${id}/plan`, { plan });
export const getSuperAdminUsers       = (params)   => api.get('/superadmin/users', { params });
export const getSuperAdminActivity    = ()         => api.get('/superadmin/activity');
export const getSuperAdminWaitlist    = (page)     => api.get('/superadmin/waitlist', { params: { page } });
export const getSuperAdminWaitlistStats = ()       => api.get('/superadmin/waitlist/stats');
export const launchSuperAdminWaitlist = ()         => api.post('/superadmin/waitlist/launch');
