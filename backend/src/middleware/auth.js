const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

const authenticateUser = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Missing or invalid Authorization header');
    }
    const token = header.slice(7);
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token', err.message));
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden: insufficient permissions'));
  }
  next();
};

module.exports = { authenticateUser, authorizeRoles };
