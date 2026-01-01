import axios from 'axios';
import secureStorage from '../utils/secureStorage.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
console.log('🔧 API_URL:', API_URL);
console.log('🔧 VITE_API_URL env:', import.meta.env.VITE_API_URL);

// CSRF Token Management
let csrfToken = null;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for CSRF
  timeout: 30000, // 30 second timeout
});

// Fetch CSRF token from server
async function fetchCSRFToken() {
  try {
    const response = await axios.get(`${API_URL}/auth/csrf-token`, {
      withCredentials: true
    });
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
}

// Initialize CSRF token on load
fetchCSRFToken();

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  async (config) => {
    // Add JWT token from secure storage
    const token = secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    const methodsRequiringCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (methodsRequiringCSRF.includes(config.method?.toUpperCase())) {
      if (!csrfToken) {
        await fetchCSRFToken();
      }
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Add request timestamp for replay attack prevention
    config.headers['X-Request-Time'] = Date.now().toString();

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Extend session on successful requests
    if (secureStorage.hasValidToken()) {
      secureStorage.extendSession();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = secureStorage.getRefreshToken();

      if (!refreshToken) {
        // No refresh token, logout
        secureStorage.removeToken();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        const { token: newToken } = response.data;
        secureStorage.setToken(newToken);

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        secureStorage.removeToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden (CSRF token invalid)
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      // Refresh CSRF token and retry
      await fetchCSRFToken();
      return api(originalRequest);
    }

    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const message = retryAfter 
        ? `Too many requests. Please try again in ${retryAfter} seconds.`
        : 'Too many requests. Please try again later.';
      
      error.userMessage = message;
    }

    // Handle network errors
    if (!error.response) {
      error.userMessage = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

export default api;

// Export helper for manual token refresh
export const refreshCSRFToken = fetchCSRFToken;

