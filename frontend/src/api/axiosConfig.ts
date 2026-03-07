import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nagarsetu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const requestUrl = error.config?.url || '';

    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/request-email-otp') ||
      requestUrl.includes('/auth/verify-email-otp');

    const storedToken = localStorage.getItem('nagarsetu_token');

    // Only treat 401 as "session expired" when a token exists and this wasn't an auth call.
    if (status === 401 && storedToken && !isAuthRoute) {
      localStorage.removeItem('nagarsetu_token');
      localStorage.removeItem('nagarsetu_user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      toast.error('Session expired. Please login again.');
    }

    // If a previously-authenticated session becomes blocked due to email verification,
    // clear local auth state and redirect to the verification page.
    if (status === 403 && code === 'EMAIL_NOT_VERIFIED' && storedToken && !isAuthRoute) {
      const storedUser = localStorage.getItem('nagarsetu_user');
      let emailParam = '';
      try {
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        if (parsed?.email) {
          emailParam = `?email=${encodeURIComponent(parsed.email)}`;
        }
      } catch {
        // Ignore parse errors
      }

      localStorage.removeItem('nagarsetu_token');
      localStorage.removeItem('nagarsetu_user');
      window.location.href = `/verify-email${emailParam}`;
      toast.error('Please verify your email to continue.');
    }

    if (!error.response) {
      toast.error('Network error. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api;
