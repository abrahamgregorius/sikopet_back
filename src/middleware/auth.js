import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { UnauthorizedError } from '../utils/errors.js';
import { supabase } from '../utils/db.js';

export async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, config.jwt.secret);

    const { data: user, error } = await supabase
      .from('user')
      .select('*, cooperative(*)')
      .eq('id', decoded.userId)
      .single();

    if (error || !user || user.deletedAt) {
      throw new UnauthorizedError('User not found');
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cooperativeId: user.cooperativeId,
      deviceId: req.headers['x-device-id'],
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  return auth(req, res, next);
}
