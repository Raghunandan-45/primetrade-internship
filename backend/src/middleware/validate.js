const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return next(new ApiError(400, 'Validation failed', issues));
  }
  req.body = result.data;
  next();
};

module.exports = validate;
