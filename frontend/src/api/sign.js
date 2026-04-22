import axios from 'axios';

const publicApi = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

export const getSignRequest = (token) => publicApi.get(`/sign/${token}`);
