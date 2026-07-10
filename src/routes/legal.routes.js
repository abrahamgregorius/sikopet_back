import { Router } from 'express';
import { legalController } from '../controllers/legal.controller.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  profileSchema,
  documentSchema,
  villagePotentialSchema,
  outletSchema,
  financingRequestSchema,
  articleSchema,
} from '../services/legal/schemas.js';

const router = Router();

// Profile
router.get('/legal/profile', auth, (req, res, next) => legalController.getProfile(req, res, next));
router.post('/legal/profile', auth, validate(profileSchema), (req, res, next) => legalController.upsertProfile(req, res, next));

// Documents
router.get('/legal/documents', auth, (req, res, next) => legalController.listDocuments(req, res, next));
router.get('/legal/documents/:id', auth, (req, res, next) => legalController.getDocument(req, res, next));
router.post('/legal/documents', auth, validate(documentSchema), (req, res, next) => legalController.createDocument(req, res, next));
router.post('/legal/documents/:id/verify', auth, (req, res, next) => legalController.verifyDocument(req, res, next));

// Village Potentials
router.get('/legal/village-potential', auth, (req, res, next) => legalController.listVillagePotentials(req, res, next));
router.post('/legal/village-potential', auth, validate(villagePotentialSchema), (req, res, next) => legalController.createVillagePotential(req, res, next));

// Outlets
router.get('/legal/outlets', auth, (req, res, next) => legalController.listOutlets(req, res, next));
router.post('/legal/outlets', auth, validate(outletSchema), (req, res, next) => legalController.createOutlet(req, res, next));

// Financing Requests
router.get('/legal/financing-requests', auth, (req, res, next) => legalController.listFinancingRequests(req, res, next));
router.post('/legal/financing-requests', auth, validate(financingRequestSchema), (req, res, next) => legalController.createFinancingRequest(req, res, next));
router.post('/legal/financing-requests/:id/submit', auth, (req, res, next) => legalController.submitFinancingRequest(req, res, next));

// External Verification
router.post('/legal/verifications/:type', auth, (req, res, next) => legalController.triggerVerification(req, res, next));

// Articles
router.get('/legal/articles', auth, (req, res, next) => legalController.listArticles(req, res, next));
router.post('/legal/articles', auth, validate(articleSchema), (req, res, next) => legalController.createArticle(req, res, next));

// Public microsite
router.get('/public/microsite/:slug', optionalAuth, (req, res, next) => legalController.getMicrosite(req, res, next));

export default router;
