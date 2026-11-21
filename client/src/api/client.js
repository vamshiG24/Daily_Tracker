import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
