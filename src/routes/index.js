import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"; // For handling CORS if frontend is on a different domain
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js"; // Import authentication routes

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware setup
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // For handling cookies (JWT)
app.use(cors()); // Enable CORS if frontend is on a different origin

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error", error);
    process.exit(1); // Exit process with failure
  }
};

// Use authentication routes
app.use("/api/auth", authRoutes); // All authentication-related routes will be under /api/auth

// Root route (optional)
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB(); 
});
