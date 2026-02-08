import express from "express";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import auth from "../middleware/authMiddleware.js";
import { adminOnly, userOnly} from "../middleware/authMiddleware.js"; 

console.log(" authRoutes file loaded");

const router = express.Router();
router.get("/ping", (req, res) => {
  console.log(" /api/auth/ping hit");
  res.send("auth ping");
});

// ✅ Register API
router.post("/register", async (req, res) => {
      console.log(" /api/auth/register hit with body:", req.body);

  const { name, email, password, role } = req.body;
  console.log(" /register body:", req.body);

  // Validate role
    const validRoles = ["user", "admin"];
    const finalRole = validRoles.includes(role) ? role : "user"; // fallback to user
  // Encrypt password
  try{
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(" Password hashed");
     // Create Admin  / User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole  // explicitly set role for role based access
    });
     console.log(" User created:", user._id);
   
  //  Send role-based message
    res.json({
      message: `Registered successfully as ${user.role}`,
      role: user.role
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login API

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user
  try{
     const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password" });
  }

  //3. create access token
  const accessToken = jwt.sign({ id: user._id, role: user.role },process.env.JWT_SECRET,{ expiresIn: "15m" });
  console.log(" Token created for user:", user._id);
  console.log(" Session token: ", accessToken);
  //4. create refresh token
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET,{ expiresIn: "7d" });
// 5. Save refresh token in DB
user.refreshToken = refreshToken;
await user.save();
// 6. Send response ONCE
 res.json({ message: "Login successful", accessToken,refreshToken});

  }
  
 catch (err) {
    console.error(" Error in /login:", err);
    res.status(500).json({ error: err.message });
  }
});

//Profile- validate token
// ✅ Get current user
router.get("/profile", auth, async (req, res) => {
  // req.user was set by the auth middleware
  res.json({ user: req.user });
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  const user = await User.findOne({ refreshToken });

  if (!user) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  const newAccessToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  res.json({ accessToken: newAccessToken });
});
//Logout API
router.post("/logout", auth, async (req, res) => {
try{
  const user = await User.findById(req.user.id);//req.user from authMiddleware decodedId
  
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
  user.refreshToken = null;
  await user.save();

  res.json({ message: "Logged out successfully" });
}
 catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-only route
router.get("/admin/dashboard", auth, adminOnly, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "admin only access" });
  }
  // If role is "user", send response
  res.json({ message: `Welcome Admin ${req.user.name}` });
});

//User-only route
router.get("/user/dashboard", auth, userOnly, (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "User only access" });
  }
  // If role is "user", send response
  res.json({ message: `Welcome User ${req.user.name}` });
});
export default router;
