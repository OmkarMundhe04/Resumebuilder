const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming User model is in 'models/User'

const router = express.Router();

// ✅ REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Check if all required fields are provided
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: "❌ All fields are required" });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "❌ Email or Username already taken" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    console.log("✅ User registered:", user);

    // Respond with success
    res.status(201).json({ message: "✅ User registered successfully. You can now log in." });
  } catch (error) {
    console.error("❌ Error in /register:", error.message);
    res.status(500).json({ error: `❌ Server error: ${error.message}` });
  }
});

// ✅ LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: "❌ Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "❌ Invalid credentials" });
    }

    // Check if password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "❌ Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: "24h" });

    // Respond with success and token
    res.json({ message: "✅ Login successful!", token });
  } catch (error) {
    console.error("❌ Error in /login:", error.message);
    res.status(500).json({ error: `❌ Server error: ${error.message}` });
  }
});

module.exports = router;
