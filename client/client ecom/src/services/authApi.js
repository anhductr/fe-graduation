import { api } from "../libs/axios";

const API_URL = '/api/v1/user-service';

export const authApi = {
  login: (data) => api.post(`${API_URL}/auth/login`, data),
  register: (data) => api.post(`${API_URL}/users/register`, data),
  logout: (token) => api.post(`${API_URL}/auth/logout`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};