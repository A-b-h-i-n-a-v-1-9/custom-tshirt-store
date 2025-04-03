import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-image.jpg"; // Ensure correct image path

const HeroSection = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-8">
      
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${heroImage})`, filter: "blur(3px) brightness(0.6)" }}
      ></div>

      {/* Hero Content with Glassmorphism Effect */}
      <div className="relative z-10 bg-green-500 bg-opacity-20 backdrop-blur-lg shadow-lg p-10 rounded-2xl max-w-3xl text-center text-green-900">
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl font-bold text-white drop-shadow-lg"
        >
          Customize Your Style, Your Way!
        </motion.h1>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-4 text-lg text-gray-200"
        >
          Explore a wide range of customizable apparel and bring your imagination to life.  
        </motion.p>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 flex justify-center space-x-4"
        >
          <Link 
            to="/shop" 
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition-transform duration-200"
          >
            Shop Now
          </Link>
          <Link 
            to="/customize" 
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-800 hover:scale-105 transition-transform duration-200"
          >
            Customize Yours
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default HeroSection;
