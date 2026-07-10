import { savingsService } from '../services/savings/index.js';

export class SavingsController {
  async listAccounts(req, res, next) {
    try {
      const result = await savingsService.listAccounts(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAccountByMember(req, res, next) {
    try {
      const result = await savingsService.getAccountByMember(req.params.memberId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createAccount(req, res, next) {
    try {
      const result = await savingsService.createAccount(req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deposit(req, res, next) {
    try {
      const result = await savingsService.deposit(req.validated.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req, res, next) {
    try {
      const result = await savingsService.withdraw(req.validated.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const result = await savingsService.getTransactions(req.params.accountId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const savingsController = new SavingsController();
