import { useEffect, useState } from "react";
import { fetchProducts } from "../api/products";
import { Link } from "react-router-dom";
import Navbar from "../components/nav_products";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ category: [], color: [], size: [] });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Filtering function
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter((product) => filters.category.includes(product.category));
    }

    if (filters.color.length > 0) {
      filtered = filtered.filter((product) => filters.color.includes(product.color));
    }

    if (filters.size.length > 0) {
      filtered = filtered.filter((product) => filters.size.includes(product.size));
    }

    setFilteredProducts(filtered);
  }, [searchQuery, filters, products]);

  return (
    <div className="container mx-auto p-6">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} filters={filters} setFilters={setFilters} />

      {loading ? (
        <p className="text-center mt-16 text-gray-500">Loading products...</p>
      ) : error ? (
        <p className="text-center mt-16 text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="bg-white p-4 rounded-lg shadow-md">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />
                <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
                <p className="text-blue-600 font-bold">₹{product.price}</p>
              </Link>
            ))
          ) : (
            <p className="text-center col-span-4 text-gray-500">No products found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;