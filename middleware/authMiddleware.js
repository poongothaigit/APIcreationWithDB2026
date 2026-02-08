// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only access" });
  }
  next();
};

export const userOnly = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "User only access" });
  }
  next();
};

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not Athorized, session token missing" });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;       // attach user to request
    req.token = token;     // optional
    next();
  } catch (err) {
    console.error(" Auth middleware error:", err.message);
    res.status(401).json({ message: "Invalid or expired session token" });
  }
};

export default auth;