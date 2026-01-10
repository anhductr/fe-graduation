import { api } from "../libs/axios";

const API_URL = '/user-service';

export const authApi = {
  // Authentication
  login: (data) => api.post(`${API_URL}/auth/login`, data),
  introspect: (data) => api.post(`${API_URL}/auth/introspect`, data),
  refresh: (data) => api.post(`${API_URL}/auth/refresh`, data),
  verifyOtp: (data) => api.post(`${API_URL}/auth/verify`, data), // Registration OTP
  forgotPasswordVerify: (data) => api.post(`${API_URL}/auth/forgot-password`, data),
  logout: (token) => api.post(`${API_URL}/auth/logout`, { token }),

  // User Management
  register: (data) => api.post(`${API_URL}/users/register`, data),
  sendVerifyEmailOtp: (data) => api.post(`${API_URL}/users/verifyEmail/send-otp`, data),
  sendForgotPasswordOtp: (data) => api.post(`${API_URL}/users/forgot-password/send-otp`, data),
  resetPassword: (data) => api.put(`${API_URL}/users/reset-password`, data),
  submitResetPassword: (data, token) => api.put(`${API_URL}/auth/reset-password`, data, { headers: { Authorization: `Bearer ${token}` } }),
  getMyInfo: () => api.get(`${API_URL}/users/myInfo`),
  getUserId: () => api.get(`${API_URL}/users/getUserId`), // Internal use mostly, but keeping it

  // Admin
  updateUserStatus: (userId, status) => api.put(`${API_URL}/users/admin/${userId}/status`, null, { params: { status } }), // Assuming status in query or clarify API
  // NOTE: API doc says "Thay đổi trạng thái user", waiting for clarify payload/params. Assuming PUT usually takes body or param. 
  // Re-reading doc: "Path Parameters: userId". Response: "User status updated". 
  // It doesn't strictly say how status is sent. I'll assume body or query? 
  // Actually doc doesn't specify status in body. I'll leave it as is for now or use a generous payload.

  getUserById: (userId) => api.get(`${API_URL}/users/admin/get-user/id/${userId}`),
  deleteUser: (userId) => api.delete(`${API_URL}/users/${userId}`),
};