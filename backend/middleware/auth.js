const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required. No token provided." 
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    const secret = process.env.JWT_SECRET || "default_jwt_secret_dev_key_change_in_prod";
    
    const decoded = jwt.verify(token, secret);
    
    // Check if user still exists in DB
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid session. User no longer exists." 
      });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name
    };
    
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired. Please log in again." 
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: "Invalid authentication token." 
    });
  }
};
