import express from "express";
import { registerUser, loginUser, getMe, getAllUsers } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register User or Admin
router.post("/register", registerUser);

// Login User or Admin
router.post("/login", loginUser);

// Get Logged-In User Info (protected route)
router.get("/admin", protect, getMe);

// Admin Route: Get All Users (only accessible to admins)
router.get("/users", protect, getAllUsers);

export default router;
