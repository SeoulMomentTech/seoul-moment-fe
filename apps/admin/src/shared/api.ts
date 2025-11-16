import { useAuthStore } from "@shared/hooks/useAuth";
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_ADMIN_API_BASE_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    "https://api.seoulmoment.com.tw",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  },
);

export { api };
