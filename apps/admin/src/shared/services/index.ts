import { useAuthStore } from "@shared/hooks/useAuth";
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

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

interface ApiResponse<T> {
  result: boolean;
  data: T;
}

interface AdminOneTimeTokenResponse {
  oneTimeToken: string;
}

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = useAuthStore.getState().refreshToken;

  if (!refreshToken) {
    useAuthStore.getState().logout();
    return null;
  }

  refreshPromise = axios
    .get<ApiResponse<AdminOneTimeTokenResponse>>(
      "/admin/auth/one-time-token",
      {
        baseURL: api.defaults.baseURL,
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    )
    .then((res) => {
      const newToken = res.data.data.oneTimeToken;
      useAuthStore.getState().updateAccessToken(newToken);
      return newToken;
    })
    .catch(() => {
      useAuthStore.getState().logout();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = (error.config ??
      {}) as InternalAxiosRequestConfig & { _retry?: boolean };

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${newToken}`,
        } as InternalAxiosRequestConfig["headers"];
        return api(originalRequest);
      }
    } else if (status === 401) {
      useAuthStore.getState().logout();
    }

    if (status === 403) {
      useAuthStore.getState().logout();
    }

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
