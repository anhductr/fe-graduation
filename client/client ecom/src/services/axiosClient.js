import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8888",
});

axiosClient.interceptors.request.use(config => {
  const fullUrl =
    (config.baseURL || "") +
    config.url;

  console.log("🚀 FULL API URL:", fullUrl);
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
