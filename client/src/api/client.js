import axios from 'axios';

// In production on Vercel, uses VITE_API_URL pointing to Render backend
// In local development, falls back to '/api' (proxied by Vite)
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
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
