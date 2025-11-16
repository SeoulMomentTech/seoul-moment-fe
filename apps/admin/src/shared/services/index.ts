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
  get: (pathname: string, options?: AxiosRequestConfig) =>
    api.get(pathname, options),
  post: (pathname: string, options?: AxiosRequestConfig) =>
    api.post(pathname, options),
  put: (pathname: string, options?: AxiosRequestConfig) =>
    api.put(pathname, options),
  patch: (pathname: string, options?: AxiosRequestConfig) =>
    api.patch(pathname, options),
  delete: (pathname: string, options?: AxiosRequestConfig) =>
    api.delete(pathname, options),
};
