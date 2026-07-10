import { ForbiddenError } from '../utils/errors.js';

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('User not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Requires one of roles: ${roles.join(', ')}`));
    }
    next();
  };
}

export function requireAnyRole(req, res, next) {
  if (!req.user) {
    return next(new ForbiddenError('User not authenticated'));
  }
  next();
}
