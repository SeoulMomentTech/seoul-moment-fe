import { useAuthStore } from "@shared/hooks/useAuth";
import axios, { type AxiosRequestConfig } from "axios";

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

    // todo: token refresh

    return Promise.reject(error);
  },
);

export const fetcher = {
  get: <T>(pathname: string, options?: AxiosRequestConfig) =>
    api.get<T>(pathname, options).then((res) => res.data),
  post: <T>(pathname: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.post<T>(pathname, data, config).then((res) => res.data),
  put: <T>(pathname: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.put<T>(pathname, data, config).then((res) => res.data),
  patch: <T>(pathname: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.patch<T>(pathname, data, config).then((res) => res.data),
  delete: <T>(pathname: string, config?: AxiosRequestConfig) =>
    api.delete<T>(pathname, config).then((res) => res.data),
};
