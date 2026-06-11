import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('mobrew_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      try {
        const newToken = await refreshPromise;
        if (original.headers) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(original);
      } catch {
        localStorage.removeItem('mobrew_access_token');
        localStorage.removeItem('mobrew_refresh_token');
        window.dispatchEvent(new Event('mobrew:auth:logout'));
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem('mobrew_refresh_token');
  if (!refresh) throw new Error('No refresh token');
  const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh });
  const { accessToken } = res.data;
  localStorage.setItem('mobrew_access_token', accessToken);
  return accessToken;
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('mobrew_access_token', accessToken);
  localStorage.setItem('mobrew_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('mobrew_access_token');
  localStorage.removeItem('mobrew_refresh_token');
}
