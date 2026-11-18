// services/api.ts
import { authStorage } from "@/config/auth.storage";
import axios from "axios";

// Define EXPO_PUBLIC_API_URL in .env, e.g. http://192.168.1.100:1337
///salon reflejos http://192.168.100.19:1337
// On an actual phone, localhost is the PHONE, not your PC.
//instituto icepal 192.168.1.42
// services/api.ts
import Constants from "expo-constants";

const getApiUrl = () => {
  // 1. Si definiste una URL manual en .env, úsala
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.trim().replace(/\/$/, "");
  }

  // 2. Toma automáticamente la IP de tu PC desde el servidor de Expo Go
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localIp = debuggerHost?.split(":")[0];

  if (localIp) {
    return `http://${localIp}:1337`;
  }

  // 3. Respaldo por defecto
  return "http://192.168.1.42:1337";
};

const API_BASE_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await authStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    // Never send application/json for multipart. Let the native XHR/browser set boundary.
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete config.headers["Content-Type"];
    }
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) await authStorage.clearSession();
    return Promise.reject(error);
  },
);
