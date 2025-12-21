import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import cartBg from "../assets/cart-bg.jpg"; // Background Image

const Cart = () => {
  const [cartProducts, setCartProducts] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/cart", {
          withCredentials: true, // ✅ Ensure cookies (auth token) are sent
        });
        setCartProducts(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          console.error("🚫 Unauthorized! Please log in again.");
        } else {
          console.error("❌ Error fetching cart products:", error.response?.data || error.message);
        }
      }
    };

    fetchCart();
  }, []);

  const updateQuantity = async (product_id, delta) => {
    // Optimistically update the UI
    setCartProducts((prev) =>
      prev.map((product) =>
        product.id === product_id
          ? { ...product, quantity: Math.max(1, product.quantity + delta) }
          : product
      )
    );

    try {
      const updatedProduct = cartProducts.find((p) => p.id === product_id);
      const newQuantity = Math.max(1, updatedProduct.quantity + delta);

      // Send updated quantity to the backend
      await axios.put(
        "http://localhost:5000/api/cart/update",
        { product_id, quantity: newQuantity },
        { withCredentials: true } // ✅ Ensure auth token is sent
      );
    } catch (error) {
      console.error("❌ Error updating cart:", error.response?.data || error.message);
      // Optionally, revert the optimistic UI update if the update fails
      setCartProducts((prev) =>
        prev.map((product) =>
          product.id === product_id
            ? { ...product, quantity: Math.max(1, product.quantity - delta) }
            : product
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col lg:flex-row gap-6 relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${cartBg})`, opacity: 0.5 }}
      ></div>

      {/* Left Side - Cart Products */}
      <div className="w-full lg:w-2/3 bg-white p-6 rounded-lg shadow-lg relative z-10">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        {cartProducts.length > 0 ? (
          cartProducts.map((product) => (
            <div key={product.id} className="flex items-center border-b py-4">
              {/* Product Image */}
              <img
                src={`${product.image}`}
                alt={product.name}
                className="w-40 h-40 object-cover rounded-lg"
              />
              {/* Product Details */}
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-lg font-bold mt-2">₹{product.price}</p>

                {/* Quantity & Size */}
                <div className="flex items-center mt-3 space-x-4">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      className="px-3 py-1 bg-gray-300 hover:bg-gray-400 transition text-lg font-bold"
                    >
                      -
                    </button>
                    <span className="px-4">{product.quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, 1)}
                      className="px-3 py-1 bg-gray-300 hover:bg-gray-400 transition text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-700">Size: {product.size}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">Your cart is empty.</p>
        )}
      </div>

      {/* Right Side - Order Summary */}
      <div className="w-full lg:w-1/3 bg-white p-6 rounded-lg shadow-lg relative z-10">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span>₹{cartProducts.reduce((sum, product) => sum + product.price * product.quantity, 0)}</span>
        </div>
        <input
          type="text"
          placeholder="Apply Coupon"
          className="mt-4 w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mt-4 transition-all">
          Apply
        </button>
        <Link
          to="/checkout"
          className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg mt-6 font-semibold transition-all"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;
