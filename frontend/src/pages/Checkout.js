import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Checkout = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/checkout/address", { withCredentials: true });
        setAddresses(response.data);
        if (response.data.length > 0) {
          setSelectedAddress(response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching addresses", error);
      }
    };

    fetchAddresses();
  }, []);

  const handleNewAddress = async () => {
    if (Object.values(newAddress).some((field) => !field)) {
      alert("All address fields are required");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/checkout/address", newAddress, { withCredentials: true });
      alert("✅ Address added successfully!");

      const updatedAddresses = await axios.get("http://localhost:5000/api/checkout/address", { withCredentials: true });
      setAddresses(updatedAddresses.data);
      setSelectedAddress(response.data.id);

      setNewAddress({ street: "", city: "", state: "", zip_code: "", country: "" });
    } catch (error) {
      console.error("❌ Error adding address:", error);
      alert("Failed to add address");
    }
  };

  const handleOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a shipping address");
      return;
    }
  
    setLoading(true);
    try {
      const cartResponse = await axios.get("http://localhost:5000/api/cart", { withCredentials: true });
      let cartItems = cartResponse.data;
  
      if (!cartItems || cartItems.length === 0) {
        alert("Your cart is empty! Please add items before placing an order.");
        setLoading(false);
        return;
      }
  
      // Ensure `product_id` is sent instead of `id`
      cartItems = cartItems.map(item => ({
        product_id: item.id, // Mapping `id` to `product_id`
        quantity: item.quantity
      }));
  
      const orderResponse = await axios.post(
        "http://localhost:5000/api/orders/place",
        { cartItems, address: selectedAddress, paymentMethod },
        { withCredentials: true }
      );
  
      alert("🎉 Order placed successfully! Order ID: " + orderResponse.data.order_id);
      navigate("/");
    } catch (error) {
      console.error("❌ Order failed:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to place order!");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      {addresses.length > 0 ? (
        <div className="mb-4">
          <label className="block font-semibold mb-2">Select Shipping Address:</label>
          <select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            {addresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.street}, {addr.city}, {addr.state}, {addr.zip_code}, {addr.country}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-gray-600">No saved addresses. Please add one below.</p>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Add New Address:</h3>
        {Object.keys(newAddress).map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field.replace("_", " ").toUpperCase()}
            value={newAddress[field]}
            onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
            className="w-full p-2 border rounded-lg mb-2"
          />
        ))}
        <button onClick={handleNewAddress} className="bg-green-600 text-white px-6 py-2 rounded-lg">
          Add Address
        </button>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Payment Method:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="COD">Cash on Delivery</option>
          <option value="Card">Credit/Debit Card</option>
          <option value="UPI">UPI</option>
        </select>
      </div>

      <button
        onClick={handleOrder}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-4"
        disabled={loading}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
};

export default Checkout;
