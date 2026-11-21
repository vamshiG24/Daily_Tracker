import axios from 'axios';

// Automatically handle VITE_API_URL whether it has trailing slashes or '/api'
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  
  // In production (Vercel deployment or standalone PWA), default to the live Render backend
  if (import.meta.env.PROD) {
    return 'https://daily-tracker-hp21.onrender.com/api';
  }
  
  // In local development, use Vite's proxy
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Card APIs
export const getCards = (params) => api.get('/cards', { params });
export const getCardByDate = (date) => api.get(`/cards/${date}`);
export const saveCard = (date, data) => api.post(`/cards/${date}`, data);
export const toggleTask = (date, taskId) => api.patch(`/cards/${date}/tasks/${taskId}/toggle`);
export const deleteCard = (date) => api.delete(`/cards/${date}`);
export const getStats = () => api.get('/cards/stats');

// AI APIs
export const sendAiMessage = (payload) => api.post('/ai/chat', payload);
export const checkHealth = () => api.get('/health');

export default api;
