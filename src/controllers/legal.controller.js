import { legalService } from '../services/legal/index.js';

export class LegalController {
  async getProfile(req, res, next) {
    try {
      const result = await legalService.getProfile(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async upsertProfile(req, res, next) {
    try {
      const result = await legalService.upsertProfile(req.user, req.validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async listDocuments(req, res, next) {
    try {
      const result = await legalService.listDocuments(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getDocument(req, res, next) {
    try {
      const result = await legalService.getDocument(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createDocument(req, res, next) {
    try {
      const result = await legalService.createDocument(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyDocument(req, res, next) {
    try {
      const result = await legalService.submitForVerification(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async listVillagePotentials(req, res, next) {
    try {
      const result = await legalService.listVillagePotentials(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createVillagePotential(req, res, next) {
    try {
      const result = await legalService.createVillagePotential(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async listOutlets(req, res, next) {
    try {
      const result = await legalService.listOutlets(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createOutlet(req, res, next) {
    try {
      const result = await legalService.createOutlet(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async listFinancingRequests(req, res, next) {
    try {
      const result = await legalService.listFinancingRequests(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createFinancingRequest(req, res, next) {
    try {
      const result = await legalService.createFinancingRequest(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async submitFinancingRequest(req, res, next) {
    try {
      const result = await legalService.submitFinancingRequest(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async triggerVerification(req, res, next) {
    try {
      const result = await legalService.triggerVerification(req.user, req.params.type);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async listArticles(req, res, next) {
    try {
      const result = await legalService.listArticles(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createArticle(req, res, next) {
    try {
      const result = await legalService.createArticle(req.user, req.validated.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMicrosite(req, res, next) {
    try {
      const result = await legalService.getMicrosite(req.params.slug);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const legalController = new LegalController();
