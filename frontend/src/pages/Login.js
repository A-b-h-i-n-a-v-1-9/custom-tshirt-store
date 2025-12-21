import { useState } from "react";
import { login } from "../api/auth";
import { setAuthSession } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(formData.email, formData.password);
      console.log("Login Response:", data); // Debugging

      if (!data.token) throw new Error("Token missing from response");

      setAuthSession(data.token, data.user); // Store in cookies
      navigate("/"); // Redirect to homepage
    } catch (err) {
      setError(err.message || "Login failed! Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
            Login
          </button>
        </form>
        <p className="text-sm mt-3">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
