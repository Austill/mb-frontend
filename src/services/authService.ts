import axios from 'axios';

// The VITE_API_URL will be injected by Vite during the build process.
// For local development, you can create a .env.local file in the root of your frontend
// and add: VITE_API_URL=http://127.0.0.1:5000/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mb-backend-sp95.onrender.com'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth functions
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const register = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};
