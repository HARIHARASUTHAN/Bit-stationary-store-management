import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Firebase ID token to every request
api.interceptors.request.use(
  async (config) => {
    if (auth && typeof auth.authStateReady === 'function') {
      try {
        await auth.authStateReady();
      } catch (_) {}
    }
    const user = auth?.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (_) {}
    }

    try {
      const session = localStorage.getItem('bsp_user_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.email) config.headers['x-user-email'] = parsed.email;
        if (parsed.role) config.headers['x-user-role'] = parsed.role;
        if (parsed.uid) config.headers['x-user-id'] = parsed.uid;
      }
    } catch (_) {}

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
