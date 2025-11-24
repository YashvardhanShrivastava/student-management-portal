// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = "super_secret_key_change_later";

function auth(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
}

function coordinatorOnly(req, res, next) {
  if (!req.user || req.user.role !== "coordinator") {
    return res.status(403).json({ message: "Access denied. Coordinator only." });
  }
  next();
}

module.exports = { auth, coordinatorOnly };
