import axios from "axios";

// ✅ Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mb-backend-sp95.onrender.com/'
});

// ✅ Attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;

// =======================
// 🔹 Auth functions
// =======================

// ✅ Login
export const login = async (credentials: { email: string; password: string }) => {
  const response = await api.post("/auth/login", credentials);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

// ✅ Register
export const register = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// ✅ Logout
export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};

// ✅ Get current user
export const getCurrentUser = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};
