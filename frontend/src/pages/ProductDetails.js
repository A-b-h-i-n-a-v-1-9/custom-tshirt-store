import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`, {
          withCredentials: true, // ✅ Ensure cookies are sent
        });
        setProduct(response.data);
      } catch (error) {
        console.error("Error loading product:", error.response?.data || error.message);
        toast.error("Failed to load product! ❌");
      }
    };
    loadProduct();
  }, [id]);

  // Function to handle Add to Cart
  const handleAddToCart = async () => {
    console.log("🛒 Debug - Sending Data:", {
        product_id: product.id, // Check if this is not undefined/null
        quantity: 1
    });

    try {
        const response = await axios.post(
            "http://localhost:5000/api/cart/add",
            {
                product_id: product.id,  // Make sure `product.id` is not undefined
                quantity: 1
            },
            { withCredentials: true }
        );
        console.log("✅ Added to cart:", response.data);
    } catch (error) {
        console.error("❌ Error adding to cart:", error.response?.data);
    }
};

  

  if (!product) {
    return <div className="text-center py-10 text-lg">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 flex flex-col md:flex-row gap-8">
      {/* Product Image */}
      <div className="w-full md:w-1/2">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-auto rounded-lg shadow-md"
        />
      </div>

      {/* Product Info */}
      <div className="w-full md:w-1/2">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-lg text-gray-600 mt-2">{product.description}</p>
        <p className="text-2xl font-semibold text-blue-600 mt-4">₹{product.price}</p>
        <p className={`mt-2 ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleAddToCart}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg"
          >
            Add to Cart
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
