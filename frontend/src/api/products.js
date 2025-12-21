import axios from "axios";

const API_URL = "http://localhost:5000/api/products"; // Base URL

// Fetch all products
export const fetchProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // Array of products
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch products!";
  }
};

// Fetch a single product by ID
export const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data; // Product details
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch product!";
  }
};
