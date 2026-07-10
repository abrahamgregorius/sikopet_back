import { supabase } from '../../utils/db.js';
import { NotFoundError } from '../../utils/errors.js';

export class LegalService {
  async getProfile(user) {
    const { data, error } = await supabase
      .from('cooperativeProfile')
      .select('*')
      .eq('cooperativeId', user.cooperativeId)
      .single();

    if (error || !data) throw new NotFoundError('Profile not found');
    return data;
  }

  async upsertProfile(user, data) {
    const { data: existing } = await supabase
      .from('cooperativeProfile')
      .select('id')
      .eq('cooperativeId', user.cooperativeId)
      .single();

    if (existing) {
      const { data: updated, error } = await supabase
        .from('cooperativeProfile')
        .update(data)
        .eq('cooperativeId', user.cooperativeId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updated;
    } else {
      const { data: created, error } = await supabase
        .from('cooperativeProfile')
        .insert({ ...data, cooperativeId: user.cooperativeId })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return created;
    }
  }

  async listDocuments(user) {
    const { data, error } = await supabase
      .from('legalDocument')
      .select('*')
      .eq('cooperativeId', user.cooperativeId)
      .order('createdAt', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getDocument(id) {
    const { data, error } = await supabase
      .from('legalDocument')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async createDocument(user, data) {
    const { data: doc, error } = await supabase
      .from('legalDocument')
      .insert({ ...data, cooperativeId: user.cooperativeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return doc;
  }

  async submitForVerification(id) {
    const { data, error } = await supabase
      .from('legalDocument')
      .update({ verificationStatus: 'pending' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async listVillagePotentials(user) {
    const { data, error } = await supabase
      .from('villagePotential')
      .select('*')
      .eq('cooperativeId', user.cooperativeId)
      .order('createdAt', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async createVillagePotential(user, data) {
    const { data: vp, error } = await supabase
      .from('villagePotential')
      .insert({ ...data, cooperativeId: user.cooperativeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return vp;
  }

  async listOutlets(user) {
    const { data, error } = await supabase
      .from('outlet')
      .select('*')
      .eq('cooperativeId', user.cooperativeId)
      .is('deletedAt', null)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async createOutlet(user, data) {
    const { data: outlet, error } = await supabase
      .from('outlet')
      .insert({ ...data, cooperativeId: user.cooperativeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return outlet;
  }

  async listFinancingRequests(user) {
    const { data, error } = await supabase
      .from('financingRequest')
      .select('*')
      .eq('cooperativeId', user.cooperativeId)
      .order('createdAt', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async createFinancingRequest(user, data) {
    const { data: fr, error } = await supabase
      .from('financingRequest')
      .insert({ ...data, cooperativeId: user.cooperativeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return fr;
  }

  async submitFinancingRequest(id) {
    const { data, error } = await supabase
      .from('financingRequest')
      .update({ status: 'submitted', submittedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async triggerVerification(user, type) {
    const { data, error } = await supabase
      .from('externalVerification')
      .insert({ cooperativeId: user.cooperativeId, type })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async listArticles(user) {
    const { data, error } = await supabase
      .from('article')
      .select('*')
      .eq('cooperativeId', user.cooperativeId)
      .order('publishedAt', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async createArticle(user, data) {
    const { data: article, error } = await supabase
      .from('article')
      .insert({ ...data, cooperativeId: user.cooperativeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return article;
  }

  async getMicrosite(slug) {
    const { data, error } = await supabase
      .from('article')
      .select('*, cooperative(*)')
      .eq('cooperative.NIB', slug)
      .not('publishedAt', 'is', null)
      .single();

    if (error || !data) throw new NotFoundError('Microsite not found');
    return data;
  }
}

export const legalService = new LegalService();
