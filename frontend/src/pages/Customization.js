import { useState } from "react";
import { SketchPicker } from "react-color";
import { motion } from "framer-motion";

const Customization = () => {
  const [shirtColor, setShirtColor] = useState("#ffffff");
  const [text, setText] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);

  // Handle Image Upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      
      {/* Page Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold text-gray-800"
      >
        Design Your Custom T-Shirt
      </motion.h1>

      <div className="mt-6 flex flex-wrap gap-10 justify-center">
        {/* Customization Panel */}
        <div className="bg-white shadow-lg p-6 rounded-xl w-96">
          <h2 className="text-xl font-semibold mb-4">Choose Shirt Color</h2>
          <SketchPicker
            color={shirtColor}
            onChangeComplete={(color) => setShirtColor(color.hex)}
          />

          <h2 className="text-xl font-semibold mt-6">Add Custom Text</h2>
          <input
            type="text"
            placeholder="Enter Text"
            className="mt-2 w-full p-2 border rounded-lg"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <h2 className="text-xl font-semibold mt-6">Upload an Image</h2>
          <input
            type="file"
            accept="image/*"
            className="mt-2 w-full"
            onChange={handleImageUpload}
          />
        </div>

        {/* Live Preview */}
        <div className="relative bg-white shadow-lg p-6 rounded-xl w-96 flex items-center justify-center">
          <motion.div
            className="w-48 h-60 rounded-lg"
            style={{ backgroundColor: shirtColor }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {uploadedImage && (
              <img
                src={uploadedImage}
                alt="Custom"
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}
            <p className="absolute bottom-2 text-center text-black font-bold w-full">
              {text}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Save & Order Button */}
      <button className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700">
        Save Design & Order Now
      </button>

    </div>
  );
};

export default Customization;
