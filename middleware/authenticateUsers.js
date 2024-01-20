const jwt = require('jsonwebtoken');
// Middleware for JWT authentication
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.TOKEN); 
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
};
module.exports = authenticateUser;