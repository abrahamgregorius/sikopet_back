import { cooperativeService, memberService, userService } from '../services/identity/index.js';
import { requireRole } from '../middleware/rbac.js';

export class CooperativeController {
  async list(req, res, next) {
    try {
      const { page, limit } = req.validated.query;
      const result = await cooperativeService.list(req.user, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const result = await cooperativeService.get(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await cooperativeService.create(req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class MemberController {
  async list(req, res, next) {
    try {
      const { page, limit } = req.validated.query;
      const result = await memberService.list(req.user, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const result = await memberService.get(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await memberService.create(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await memberService.update(req.params.id, req.validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class UserController {
  async list(req, res, next) {
    try {
      const { page, limit } = req.validated.query;
      const result = await userService.list(req.user, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const result = await userService.get(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await userService.create(req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await userService.update(req.params.id, req.validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const cooperativeController = new CooperativeController();
export const memberController = new MemberController();
export const userController = new UserController();
