import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, User, ChevronDown } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // You'll want to replace this with actual auth state

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Add your logout logic here
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full backdrop-blur-lg bg-yellow-500/20 shadow-md z-50"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-wide text-white">
          Print Genie
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-blue-300 transition">Home</Link>
          <Link to="/products" className="text-white hover:text-blue-300 transition">Shop</Link>
          <Link to="/customize" className="text-white hover:text-blue-300 transition">Customize</Link>
          <Link to="/profile" className="text-white hover:text-blue-300 transition">Profile</Link>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4 relative">
          <Link to="/cart" className="text-white hover:text-gray-300 transition">
            <ShoppingCart size={24} />
          </Link>
          
          {/* User Dropdown */}
          <div className="relative">
            <button 
              onClick={toggleDropdown}
              className="flex items-center text-white hover:text-gray-300 transition"
            >
              <User size={24} />
              <ChevronDown size={16} className={`ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Login
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;