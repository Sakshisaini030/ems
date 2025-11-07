import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js"; // Utility to generate JWT token

// Register a new user or admin
const registerUser = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Set role to User by default, but allow role to be set during registration
    const userRole = role || "User"; // Default role is "User"

    // Create a new user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: userRole, // Admin or User role
    });

    // Generate a token
    const token = generateToken(user._id);

    // Respond with the user data and token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login User or Admin
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email }).select("+password"); // +password is used to include the password field

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    // Respond with the user data and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Logged-In User Info
const getMe = async (req, res) => {
  try {
    // Find user by ID from the token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user info
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users (Only for Admins)
const getAllUsers = async (req, res) => {
  try {
    // Only allow admins to get all users
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { registerUser, loginUser, getMe, getAllUsers };
