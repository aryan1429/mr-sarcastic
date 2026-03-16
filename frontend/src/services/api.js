import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 8000,  // 8 seconds cap
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Sleep utility for retry delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate exponential backoff delay with jitter
const getRetryDelay = (attempt) => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
    RETRY_CONFIG.maxDelay
  );
  // Add random jitter (±25%) to prevent thundering herd
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
};

// Check if a request should be retried
const shouldRetry = (error) => {
  // Don't retry if request was explicitly aborted
  if (axios.isCancel(error)) return false;

  // Retry on network errors (no response received)
  if (!error.response) return true;

  // Retry on specific status codes
  return RETRY_CONFIG.retryableStatuses.includes(error.response.status);
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, // 90 seconds for mobile reliability
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token and track retry count
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Initialize retry metadata
    if (config._retryCount === undefined) {
      config._retryCount = 0;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor with retry logic and auth error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;

    // Handle auth errors (no retry)
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return Promise.reject(error);
    }

    // Retry logic
    if (config && shouldRetry(error) && config._retryCount < RETRY_CONFIG.maxRetries) {
      config._retryCount += 1;
      const delay = getRetryDelay(config._retryCount - 1);

      console.log(
        `🔄 Retry ${config._retryCount}/${RETRY_CONFIG.maxRetries} for ${config.url} in ${delay}ms` +
        (error.response ? ` (status: ${error.response.status})` : ' (network error)')
      );

      await sleep(delay);

      // Return a new request with the same config
      return api(config);
    }

    return Promise.reject(error);
  }
);

class AuthService {
  async loginWithEmail(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));

      return { token, user };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  async registerWithEmail(username, email, password) {
    try {
      console.log('Attempting registration with base URL:', api.defaults.baseURL);
      console.log('Full URL will be:', `${api.defaults.baseURL}/auth/register`);
      const response = await api.post('/auth/register', { username, email, password });
      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));

      return { token, user };
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  async loginWithGoogle(credential) {
    try {
      const response = await api.post('/auth/google', { credential });
      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));

      return { success: true, user, token };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Google login failed');
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }

  async refreshToken() {
    try {
      const currentToken = localStorage.getItem('authToken');
      if (!currentToken) {
        throw new Error('No token to refresh');
      }

      const response = await api.post('/auth/refresh', { token: currentToken });
      const { token, user } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));

      return { success: true, user, token };
    } catch (error) {
      this.logout(); // Clear invalid token
      throw new Error('Token refresh failed');
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

class UserService {
  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  }

  async updateProfile(userData) {
    const response = await api.put('/users/me', userData);

    // Update local storage
    const updatedUser = response.data.user;
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return response.data;
  }

  async updateProfilePicture(file) {
    const formData = new FormData();
    formData.append('picture', file);

    const response = await api.put('/users/me/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Update local storage
    const updatedUser = response.data.user;
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return response.data;
  }

  async deleteAccount() {
    const response = await api.delete('/users/me');

    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    return response.data;
  }

  async getUserStats() {
    const response = await api.get('/users/me/stats');
    return response.data;
  }

  async getFavoriteSongs() {
    const response = await api.get('/users/me/favorites');
    return response.data;
  }

  async addFavoriteSong(songId) {
    const response = await api.post(`/users/me/favorites/${songId}`);
    return response.data;
  }

  async removeFavoriteSong(songId) {
    const response = await api.delete(`/users/me/favorites/${songId}`);
    return response.data;
  }
}

class StorageService {
  async uploadFile(file, folder = 'uploads') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getUserFiles(folder = 'uploads') {
    const response = await api.get('/storage/files', {
      params: { folder }
    });
    return response.data;
  }

  async getFileUrl(fileName, expirationMinutes = 60) {
    const response = await api.get(`/storage/files/${encodeURIComponent(fileName)}/url`, {
      params: { expirationMinutes }
    });
    return response.data;
  }

  async deleteFile(fileName) {
    const response = await api.delete(`/storage/files/${encodeURIComponent(fileName)}`);
    return response.data;
  }

  async saveUserData(key, data) {
    const response = await api.post(`/storage/data/${key}`, { data });
    return response.data;
  }

  async getUserData(key) {
    const response = await api.get(`/storage/data/${key}`);
    return response.data;
  }
}

export const authService = new AuthService();
export const userService = new UserService();
export const storageService = new StorageService();
export { api };
