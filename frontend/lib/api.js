import axios from 'axios';
import { auth } from './firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Firebase auth token to requests
api.interceptors.request.use(async (config) => {
    try {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (error) {
        console.error('Token error:', error);
    }
    return config;
});

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (idToken) => api.post('/auth/login', { idToken }),
};

// User API
export const userAPI = {
    getProfile: () => api.get('/user/profile'),
    getHistory: () => api.get('/user/history'),
    getTokenBalance: () => api.get('/user/token-balance'),
    getDashboard: () => api.get('/user/dashboard'),
    redeem: (data) => api.post('/user/redeem', data),
    getRedemptions: () => api.get('/user/redemptions'),
};

// Waste API
export const wasteAPI = {
    submit: (formData) => {
        return api.post('/waste/submit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getSubmissions: () => api.get('/waste/submissions'),
    getSubmission: (id) => api.get(`/waste/submission/${id}`),
};

// Verifier API
export const verifierAPI = {
    getPending: () => api.get('/verifier/pending'),
    verify: (submissionId, data) => api.post(`/verifier/verify/${submissionId}`, data),
    getHistory: () => api.get('/verifier/history'),
    scanQR: (qrData) => api.post('/verifier/scan-qr', { qrData }),
};

export default api;
