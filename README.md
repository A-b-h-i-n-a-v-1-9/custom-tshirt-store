# Custom T-Shirt E-Commerce Website

## 📌 Project Overview
This is a full-stack e-commerce website where users can customize and purchase t-shirts. It features live 3D customization using **Three.js**, secure authentication, and order management. The database is managed using **MySQL**, ensuring structured and efficient data handling.

## 🛠️ Tech Stack
### **Frontend:**
- React
- Axios
- React Router
- Three.js (@react-three/fiber, @react-three/drei) for 3D customization

### **Backend:**
- Node.js
- Express.js
- MySQL (Database)
- JWT for authentication
- Multer for image uploads
- bcrypt for password hashing

### **Database (MySQL) Tables:**
- **Users Table** → Stores customer and admin data
- **Products Table** → Stores product details
- **Cart Table** → Stores items added to the cart
- **Orders Table** → Stores user orders
- **Payments Table** → Stores payment information
- **CustomDesigns Table** → Stores uploaded custom t-shirt designs

---

## 📂 Project Structure
```
custom-tshirt-store/
│── 📂 backend/            # Node.js + Express Backend
│   ├── 📂 config/         # Database connection & env setup
│   │   ├── db.js          # MySQL connection
│   │   ├── dotenv.js      # Load environment variables
│   │
│   ├── 📂 models/         # MySQL tables (ORM)
│   │   ├── UserModel.js   
│   │   ├── ProductModel.js
│   │   ├── CartModel.js   
│   │   ├── OrderModel.js  
│   │   ├── PaymentModel.js  
│   │   ├── CustomDesignModel.js  
│   │
│   ├── 📂 routes/         # API routes
│   │   ├── authRoutes.js  
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js  
│   │   ├── orderRoutes.js  
│   │   ├── paymentRoutes.js  
│   │   ├── designRoutes.js  
│   │
│   ├── 📂 controllers/    # Logic for handling API requests
│   │   ├── authController.js  
│   │   ├── productController.js
│   │   ├── cartController.js  
│   │   ├── orderController.js  
│   │   ├── paymentController.js  
│   │   ├── designController.js  
│   │
│   ├── 📂 middleware/     # Authentication, validation, etc.
│   │   ├── authMiddleware.js
│   │
│   ├── 📂 uploads/        # Custom t-shirt designs uploaded by users
│   ├── 📜 server.js       # Main backend file (Starts Express Server)
│   ├── 📜 .env            # Environment variables (DB credentials)
│   ├── 📜 package.json    # Dependencies
│
│── 📂 frontend/           # React Frontend
│   ├── 📂 src/
│   │   ├── 📂 components/   # Reusable UI components
│   │   ├── 📂 pages/        # Pages (Home, Cart, Profile, etc.)
│   │   ├── 📂 api/          # Axios API calls
│   │   ├── 📂 assets/       # Images, logos, icons
│   │   ├── 📂 styles/       # Global CSS styles
│   │   ├── 📜 App.js        # Main React component
│   │   ├── 📜 index.js      # Entry point
│   ├── 📜 package.json
│
│── 📜 README.md
│── 📜 .gitignore
```

---

## ⚙️ Setup Instructions
### **1️⃣ Clone the repository**
```sh
git clone https://github.com/your-repo/custom-tshirt-store.git
cd custom-tshirt-store
```

### **2️⃣ Backend Setup**
```sh
cd backend
npm install
```
- Create a **.env** file in `backend/` and add:
  ```env
  DB_HOST=your_host
  DB_USER=your_username
  DB_PASSWORD=your_password
  DB_NAME=your_database
  JWT_SECRET=your_secret_key
  ```
- Start the backend server:
  ```sh
  npm run dev
  ```

### **3️⃣ MySQL Database Setup**
1. Open MySQL and create the database:
   ```sql
   CREATE DATABASE custom_tshirt_db;
   ```
2. Use the database:
   ```sql
   USE custom_tshirt_db;
   ```
3. Create necessary tables:
   ```sql
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255),
       email VARCHAR(255) UNIQUE,
       password VARCHAR(255)
   );
   ```
   _(Repeat for other tables like `products`, `cart`, `orders`, `payments`, `custom_designs`)_

### **4️⃣ Frontend Setup**
```sh
cd ../frontend
npm install
npm start
```

---

## 📌 Features
- **User Authentication** (Signup/Login with JWT + MySQL)
- **Custom T-Shirt Design** (Upload image & preview on 3D model, stored in MySQL)
- **Shopping Cart & Checkout** (Cart data managed in MySQL)
- **Payment Processing**
- **Order History & Tracking**


