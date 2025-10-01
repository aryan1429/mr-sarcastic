import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

console.log('Environment variables:', import.meta.env);
console.log('VITE_API_BASE_URL from env:', import.meta.env.VITE_API_BASE_URL);
console.log('API_BASE_URL configured as:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Token in localStorage:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set');
    } else {
      console.log('No token, skipping authorization header');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // Don't auto-redirect here, let the auth context handle it
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
