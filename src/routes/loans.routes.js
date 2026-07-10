import { Router } from 'express';
import { loanController, depositController } from '../controllers/loans.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import {
  createLoanSchema,
  updateLoanSchema,
  approveLoanSchema,
  rejectLoanSchema,
  disburseLoanSchema,
  paymentSchema,
  createDepositSchema,
} from '../services/loans/schemas.js';

const router = Router();

// Loans
router.get('/', auth, (req, res, next) => loanController.list(req, res, next));
router.get('/:id', auth, (req, res, next) => loanController.get(req, res, next));
router.post('/', auth, validate(createLoanSchema), (req, res, next) => loanController.create(req, res, next));
router.put('/:id', auth, validate(updateLoanSchema), (req, res, next) => loanController.update(req, res, next));
router.post('/:id/submit', auth, (req, res, next) => loanController.submit(req, res, next));
router.post('/:id/approve', auth, requireRole('ba'), validate(approveLoanSchema), (req, res, next) => loanController.approve(req, res, next));
router.post('/:id/reject', auth, requireRole('ba'), validate(rejectLoanSchema), (req, res, next) => loanController.reject(req, res, next));
router.get('/pending-approval', auth, requireRole('ba'), (req, res, next) => loanController.pendingApproval(req, res, next));
router.get('/overdue', auth, requireRole('pmo'), (req, res, next) => loanController.overdue(req, res, next));
router.post('/:id/disburse', auth, validate(disburseLoanSchema), (req, res, next) => loanController.disburse(req, res, next));
router.get('/:id/schedule', auth, (req, res, next) => loanController.getSchedule(req, res, next));
router.post('/:loanId/payments', auth, validate(paymentSchema), (req, res, next) => loanController.recordPayment(req, res, next));

// Deposits
router.get('/deposits/list', auth, (req, res, next) => depositController.list(req, res, next));
router.post('/deposits', auth, validate(createDepositSchema), (req, res, next) => depositController.create(req, res, next));

export default router;
