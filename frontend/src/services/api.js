import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Firebase ID token and session headers to every request
api.interceptors.request.use(
  async (config) => {
    // 1. Immediately attach session headers from localStorage so backend has identity
    try {
      const session = localStorage.getItem('bsp_user_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.email) config.headers['x-user-email'] = parsed.email;
        if (parsed.role) config.headers['x-user-role'] = parsed.role;
        if (parsed.uid) config.headers['x-user-id'] = parsed.uid;
      }
    } catch (_) {}

    // 2. Attach Bearer token from Firebase Auth if currentUser is available
    let user = auth?.currentUser;
    if (!user && auth && typeof auth.authStateReady === 'function') {
      try {
        await Promise.race([
          auth.authStateReady(),
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]);
        user = auth?.currentUser;
      } catch (_) {}
    }

    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (_) {}
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: centralized error handling & automatic retry on initial startup
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Auto-retry GET requests on transient network or connection errors (up to 3 attempts)
    if (
      config &&
      config.method === 'get' &&
      (!config._retryCount || config._retryCount < 3) &&
      (error.code === 'ERR_NETWORK' ||
        error.message?.includes('Network Error') ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout'))
    ) {
      config._retryCount = (config._retryCount || 0) + 1;
      const backoffDelay = config._retryCount * 600;
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      return api(config);
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
