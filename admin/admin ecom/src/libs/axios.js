// api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
});

const refreshApi = axios.create({
  baseURL: "/api/v1",
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/* ================= REQUEST ================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ================= RESPONSE ================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("error: ", error.response);
    // Kiểm tra nếu lỗi 401 và chưa retry lần nào
    if (error.response?.data.code === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang có tiến trình refresh thì queue các request khác lại
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const oldToken = localStorage.getItem("token");

      if (!oldToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const res = await refreshApi.post(
          "/user-service/auth/refresh",
          { token: oldToken }
        );

        const newToken = res.data?.result?.token;

        if (!newToken) {
          throw new Error("No token returned");
        }

        // Lưu token mới
        localStorage.setItem("token", newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        // Retry các request đang chờ
        processQueue(null, newToken);

        // Retry request hiện tại
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại -> logout -> redirect login
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

export { api };
