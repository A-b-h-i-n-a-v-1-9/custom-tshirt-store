import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, User, Search, Filter, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Navbar = ({ searchQuery, setSearchQuery, filters, setFilters }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([100, 2000]); // INR
  const filterRef = useRef(null);

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...prev[type], value],
    }));
  };

  // Handle price range updates
  const handlePriceChange = (e, index) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = Number(e.target.value);
    setPriceRange(newPriceRange);
    setFilters((prev) => ({ ...prev, price: newPriceRange }));
  };

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full backdrop-blur-lg bg-yellow-500/50 shadow-md z-50"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white tracking-wide">
          CustomWear
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-blue-300 transition">Home</Link>
          <Link to="/products" className="text-white hover:text-blue-300 transition">Shop</Link>
          <Link to="/customize" className="text-white hover:text-blue-300 transition">Customize</Link>
          <Link to="/contact" className="text-white hover:text-blue-300 transition">Contact</Link>
        </div>

        {/* Search & Filter */}
        <div className="relative flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "16rem", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="flex items-center bg-white text-black rounded-full shadow-md border p-2 w-64"
                >
                  <Search className="text-gray-600 ml-2" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow ml-2 outline-none bg-transparent"
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="mr-2 text-gray-600">
                    <X size={20} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {!isSearchOpen && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-white hover:text-gray-300 transition"
              >
                <Search size={24} />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button className="text-white hover:text-gray-300 transition" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter size={24} />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold">Filters</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="text-gray-600">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-bold">Category</h3>
                    {["t_shirt", "mug", "bottle"].map((category) => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category)}
                          onChange={() => handleFilterChange("category", category)}
                        />
                        <span className="text-sm text-gray-800 capitalize">{category.replace("_", " ")}</span>
                      </label>
                    ))}
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <h3 className="text-sm font-bold">Price Range (INR)</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        min="100"
                        max="2000"
                        onChange={(e) => handlePriceChange(e, 0)}
                        className="w-20 border p-1 rounded"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        min="100"
                        max="2000"
                        onChange={(e) => handlePriceChange(e, 1)}
                        className="w-20 border p-1 rounded"
                      />
                    </div>
                  </div>                  
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart & Profile Icons */}
          <Link to="/cart" className="text-white hover:text-gray-300 transition">
            <ShoppingCart size={24} />
          </Link>
          <Link to="/login" className="text-white hover:text-gray-300 transition">
            <User size={24} />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
