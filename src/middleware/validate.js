import { ValidationError } from '../utils/errors.js';

export function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        const details = result.error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        throw new ValidationError('Validation failed', details);
      }

      req.validated = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}
