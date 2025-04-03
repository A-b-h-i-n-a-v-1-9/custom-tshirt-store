import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-10 py-12">
      <h1 className="text-4xl font-bold text-center text-gray-800">Our T-Shirts</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
        {products.map(product => (
          <motion.div 
            key={product.id} 
            className="bg-white rounded-lg shadow-lg p-6 hover:scale-105 transition"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img src={product.image} alt={product.name} className="w-full rounded-lg" />
            <h3 className="text-xl font-semibold mt-4">{product.name}</h3>
            <p className="text-gray-500">${product.price}</p>
            <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Add to Cart
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Products;
