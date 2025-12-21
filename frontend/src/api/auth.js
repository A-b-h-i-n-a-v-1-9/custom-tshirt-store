import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Enhanced API service with better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 
                       error.response?.data?.message || 
                       "Login failed. Please try again.";
    throw new Error(errorMessage);
  }
};

export const register = async (userData) => {
  try {
    // Ensure required fields are present
    if (!userData.name || !userData.email || !userData.password || !userData.phone) {
      throw new Error("All fields are required");
    }

    const response = await api.post("/auth/signup", {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 
                       error.response?.data?.message || 
                       error.message || 
                       "Registration failed. Please try again.";
    throw new Error(errorMessage);
  }
};