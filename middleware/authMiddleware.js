const jwt = require('jsonwebtoken');

exports.isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer token
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        req.user = decoded; // Attach user data to the request
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};




exports.isAdminAuthenticated = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Extract the token

        if (!token) {
            return res.status(401).json({ error: "You are not authorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        req.user = decoded; // Attach user data to the request

        next(); // Proceed to the next middleware
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
