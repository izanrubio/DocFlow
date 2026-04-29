import api from '../utils/api';

export const getTeam             = ()                    => api.get('/team');
export const inviteMember        = (email, role)         => api.post('/team/invite', { email, role });
export const updateMemberRole    = (userId, role)        => api.put(`/team/${userId}/role`, { role });
export const removeMember        = (userId)              => api.delete(`/team/${userId}`);
export const resendInvitation    = (invitationId)        => api.post(`/team/invitations/${invitationId}/resend`);
export const cancelInvitation    = (invitationId)        => api.delete(`/team/invitations/${invitationId}`);
export const acceptInvitation    = (token, name, password, password_confirmation) =>
    api.post(`/team/accept/${token}`, { name, password, password_confirmation });
export const transferOwnership   = (userId)              => api.post(`/team/transfer-ownership/${userId}`);
