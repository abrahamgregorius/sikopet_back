import { loanService, depositService } from '../services/loans/index.js';

export class LoanController {
  async list(req, res, next) {
    try {
      const result = await loanService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const result = await loanService.get(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await loanService.create(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await loanService.update(req.params.id, req.validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async submit(req, res, next) {
    try {
      const result = await loanService.submit(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const result = await loanService.approve(req.params.id, req.user, req.body.notes);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const result = await loanService.reject(req.params.id, req.user, req.body.notes);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async pendingApproval(req, res, next) {
    try {
      const result = await loanService.pendingApproval();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async overdue(req, res, next) {
    try {
      const result = await loanService.overdue();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async disburse(req, res, next) {
    try {
      const result = await loanService.disburse(req.params.id, req.validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSchedule(req, res, next) {
    try {
      const result = await loanService.getSchedule(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async recordPayment(req, res, next) {
    try {
      const result = await loanService.recordPayment(req.params.loanId, req.validated.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class DepositController {
  async list(req, res, next) {
    try {
      const result = await depositService.list(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await depositService.create(req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const loanController = new LoanController();
export const depositController = new DepositController();
