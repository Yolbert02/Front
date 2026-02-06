const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    console.log(`[Validation] Validating request body for ${req.method} ${req.originalUrl}`);
    req.body = schema.parse(req.body);
    console.log(`[Validation] Success! Data is valid.`);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(`[Validation Error] Validation failed for ${req.method} ${req.originalUrl}`);
      console.error(JSON.stringify(error.errors, null, 2));

      const errorMessages = Array.isArray(error.errors)
        ? error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
        : [{ field: 'unknown', message: error.message }];

      return res.status(400).json({
        success: false,
        message: 'Data validation error',
        errors: errorMessages,
      });
    }
    next(error);
  }
};

module.exports = validate;
