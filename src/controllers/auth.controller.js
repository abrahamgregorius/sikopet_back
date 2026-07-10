import { authService } from '../services/auth/index.js';

export class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.validated.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.validated.body;
      const result = await authService.refresh(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const result = await authService.logout(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async registerDevice(req, res, next) {
    try {
      const { deviceId, platform } = req.validated.body;
      const result = await authService.registerDevice(req.user.id, deviceId, platform);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
