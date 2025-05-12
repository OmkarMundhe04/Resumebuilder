const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    try {
        // Get token from header
        const authHeader = req.header("Authorization");

        if (!authHeader) {
            return res.status(401).json({ error: "❌ Access denied. No token provided." });
        }

        // Extract token (handle both "Bearer TOKEN" and direct "TOKEN")
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

        // Ensure JWT_SECRET is set in .env
        if (!process.env.JWT_SECRET) {
            console.error("❌ Missing JWT_SECRET in .env file");
            return res.status(500).json({ error: "❌ Internal Server Error: JWT_SECRET is missing" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user payload to request
        next();
    } catch (error) {
        console.error("❌ JWT Verification Error:", error.message);
        return res.status(401).json({ error: "❌ Invalid or expired token" });
    }
};
