import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator"; // For email/phone validation
import jwt from "jsonwebtoken"; // For token generation

// OTP Schema and Model for OTP-based login
const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // OTP expires in 5 minutes
  },
});

export const Otp = mongoose.model("Otp", otpSchema);

// User Schema with OTP login, password-based login, roles, and additional fields
const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["User", "Admin"], 
      default: "User", // Default role is "User", can be changed to "Admin"
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows null or undefined email (for OTP login)
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"], // Email validation
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
      unique: true,
      trim: true,
      validate: [validator.isMobilePhone, "Please provide a valid phone number"], // Phone validation
    },
    password: {
      type: String,
      required: function () {
        // If OTP login, password is optional
        return !this.isOtpLogin;
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries unless explicitly requested
    },
    isOtpLogin: {
      type: Boolean,
      default: false, // Indicates whether the login is OTP-based
    },
    otp: {
      code: String, // OTP code for OTP-based login
      expiresAt: Date, // OTP expiration time
    },
    resetPasswordToken: String, // Reset token for forgotten password flow
    resetPasswordExpires: Date, // Expiry time for reset token
    cardData: {
      type: Object,
      default: {}, // Store card information as a JSON object
    },
    // Address and other location details
    pincode: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    townVillage: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    minimize: false,  // Prevent empty objects from being removed (e.g., cardData)
  }
);

// Encrypt password before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash the password if it was modified
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match entered password with the stored password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if OTP is still valid
userSchema.methods.isOtpValid = function () {
  return this.otp && this.otp.expiresAt > Date.now(); // Check if OTP has expired
};

// Method to assign role (Admin or User)
userSchema.methods.assignRole = function (role) {
  if (["User", "Admin"].includes(role)) {
    this.role = role; // Assign the role if valid
  } else {
    throw new Error("Invalid role"); // Throw error if an invalid role is provided
  }
};

// Method to generate a password reset token
userSchema.methods.generateResetPasswordToken = function () {
  // Generate a JWT token for password reset
  const resetToken = jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Token expires in 1 hour
  );

  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // Token expires in 1 hour
  return resetToken;
};

// Export User model
const User = mongoose.model("User", userSchema);

export default User;
