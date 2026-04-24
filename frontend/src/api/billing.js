import api from '../utils/api';

export const getPlans        = ()       => api.get('/billing/plans');
export const getUsage        = ()       => api.get('/billing/usage');
export const getSubscription = ()       => api.get('/billing/subscription');
export const createCheckout  = (plan)   => api.post(`/billing/checkout/${plan}`);
export const createPortal    = ()       => api.post('/billing/portal');
export const devSetPlan      = (plan)   => api.post(`/dev/set-plan/${plan}`);
