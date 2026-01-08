import axios from 'axios';

const API_URL = '/api/v1/user-service'; 

export const authApi = {
  login: (data) => axios.post(`${API_URL}/auth/login`, data), 
  register: (data) => axios.post(`${API_URL}/users/register`, data), 
  logout: (token) => axios.post(`${API_URL}/auth/logout`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};