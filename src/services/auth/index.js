import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import { supabase } from '../../utils/db.js';
import { UnauthorizedError, ConflictError } from '../../utils/errors.js';

export class AuthService {
  async login(email, password) {
    const { data: user, error } = await supabase
      .from('user')
      .select('*, cooperative(*)')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.deletedAt) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  async refresh(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret);
      const { data: user, error } = await supabase
        .from('user')
        .select('*, cooperative(*)')
        .eq('id', decoded.userId)
        .single();

      if (error || !user || user.deletedAt) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId) {
    return { success: true };
  }

  async registerDevice(userId, deviceId, platform) {
    const { data: existing } = await supabase
      .from('device')
      .select('*')
      .eq('deviceId', deviceId)
      .single();

    if (existing) {
      throw new ConflictError('Device already registered');
    }

    const { data: device, error } = await supabase
      .from('device')
      .insert({ userId, deviceId, platform })
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase
      .from('user')
      .update({ deviceId })
      .eq('id', userId);

    return device;
  }

  generateAccessToken(user) {
    return jwt.sign(
      { userId: user.id, role: user.role, cooperativeId: user.cooperativeId },
      config.jwt.secret,
      { expiresIn: config.jwt.accessTokenExpiry }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user.id },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshTokenExpiry }
    );
  }

  sanitizeUser(user) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}

export const authService = new AuthService();
