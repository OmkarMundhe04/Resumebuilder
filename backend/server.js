require("dotenv").config(); // ✅ <--- ADD THIS LINE AT THE TOP

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');  // For session management
const authRoutes = require('./routes/auth');  // Auth routes for register/login
const resumeRoutes = require('./routes/resume');  // Resume routes

const app = express();

// MongoDB connection for 'resumebuilder' database
mongoose.connect(process.env.MONGO_URI, { // ✅ Now use your env variable
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected successfully to 'resumebuilder' database"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Session middleware for handling sessions
app.use(session({
  secret: process.env.JWT_SECRET || 'default-secret', // ✅ use env secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
