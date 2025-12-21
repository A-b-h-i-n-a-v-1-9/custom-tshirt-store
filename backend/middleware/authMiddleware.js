const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.authToken; // ✅ Read token from cookies

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." }); // Fix here: Ensure you're returning JSON
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." }); // Fix here: Ensure you're returning JSON
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {  
      next();
  } else {
      return res.status(403).json({ message: "Forbidden: Admins only!" });
  }
};


const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  generateAccessToken,
  generateRefreshToken,
};
