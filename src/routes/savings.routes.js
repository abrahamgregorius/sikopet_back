import { Router } from 'express';
import { savingsController } from '../controllers/savings.controller.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createSavingsAccountSchema, depositSchema, withdrawSchema } from '../services/savings/schemas.js';

const router = Router();

router.get('/accounts', auth, (req, res, next) => savingsController.listAccounts(req, res, next));
router.get('/accounts/:memberId', auth, (req, res, next) => savingsController.getAccountByMember(req, res, next));
router.post('/accounts', auth, validate(createSavingsAccountSchema), (req, res, next) => savingsController.createAccount(req, res, next));
router.post('/deposit', auth, validate(depositSchema), (req, res, next) => savingsController.deposit(req, res, next));
router.post('/withdraw', auth, validate(withdrawSchema), (req, res, next) => savingsController.withdraw(req, res, next));
router.get('/transactions/:accountId', auth, (req, res, next) => savingsController.getTransactions(req, res, next));

export default router;
