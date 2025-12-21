import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";

// Load the texture (user-uploaded image)
const CustomModel = ({ image, modelType }) => {
  const texture = useLoader(THREE.TextureLoader, image);
  const meshRef = useRef();

  return (
    <mesh ref={meshRef}>
      {modelType === "t_shirt" && <TShirt texture={texture} />}
      {modelType === "mug" && <Mug texture={texture} />}
      {modelType === "bottle" && <Bottle texture={texture} />}
    </mesh>
  );
};

const TShirt = ({ texture }) => (
  <mesh>
    <boxGeometry args={[2, 2.5, 0.1]} />
    <meshStandardMaterial map={texture} />
  </mesh>
);

const Mug = ({ texture }) => (
  <mesh>
    <cylinderGeometry args={[1, 1, 2, 32]} />
    <meshStandardMaterial map={texture} />
  </mesh>
);

const Bottle = ({ texture }) => (
  <mesh>
    <cylinderGeometry args={[0.8, 0.8, 3, 32]} />
    <meshStandardMaterial map={texture} />
  </mesh>
);

const ProductCustomizer = () => {
  const [selectedModel, setSelectedModel] = useState("t_shirt");
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">Customize Your Product</h1>

      {/* Model Selection */}
      <select
        className="border p-2 rounded my-4"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        <option value="t_shirt">T-Shirt</option>
        <option value="mug">Mug</option>
        <option value="bottle">Bottle</option>
      </select>

      {/* Image Upload */}
      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />

      {/* 3D Model Canvas */}
      <Canvas className="w-full h-[500px] bg-gray-200">
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} intensity={1} />
        {uploadedImage && <CustomModel image={uploadedImage} modelType={selectedModel} />}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default ProductCustomizer;
