import { supabase } from '../../utils/db.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { buildPaginationQuery, buildPaginatedResponse } from '../../utils/helpers.js';

export class CooperativeService {
  async list(user, page = 1, limit = 20) {
    const { data: cooperatives, error } = await supabase
      .from('cooperative')
      .select('*');

    if (error) throw new Error(error.message);

    let filtered = cooperatives;
    if (user.role === 'operator' || user.role === 'ba') {
      filtered = cooperatives.filter(c => c.id === user.cooperativeId);
    }

    const total = filtered.length;
    const { take, skip } = buildPaginationQuery(page, limit);
    const paginated = filtered.slice(skip, skip + take);

    return buildPaginatedResponse(paginated, total, page, limit);
  }

  async get(id) {
    const { data: cooperative, error } = await supabase
      .from('cooperative')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !cooperative) throw new NotFoundError('Cooperative not found');
    return cooperative;
  }

  async create(data) {
    const { data: cooperative, error } = await supabase
      .from('cooperative')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return cooperative;
  }
}

export class MemberService {
  async list(user, page = 1, limit = 20) {
    let query = supabase
      .from('member')
      .select('*', { count: 'exact' })
      .is('deletedAt', null);

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('cooperativeId', user.cooperativeId);
    }

    const { data: members, error, count } = await query
      .order('createdAt', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new Error(error.message);
    return buildPaginatedResponse(members || [], count || 0, page, limit);
  }

  async get(id) {
    const { data: member, error } = await supabase
      .from('member')
      .select('*')
      .eq('id', id)
      .is('deletedAt', null)
      .single();

    if (error || !member) throw new NotFoundError('Member not found');
    return member;
  }

  async create(user, data) {
    const { data: member, error } = await supabase
      .from('member')
      .insert({ ...data, cooperativeId: user.cooperativeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return member;
  }

  async update(id, data) {
    const { data: member, error } = await supabase
      .from('member')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !member) throw new NotFoundError('Member not found');
    return member;
  }
}

export class UserService {
  async list(user, page = 1, limit = 20) {
    let query = supabase
      .from('user')
      .select('id, email, name, role, cooperativeId, createdAt')
      .is('deletedAt', null);

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('cooperativeId', user.cooperativeId);
    }

    const { data: users, error, count } = await query
      .order('createdAt', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new Error(error.message);
    return buildPaginatedResponse(users || [], count || 0, page, limit);
  }

  async get(id) {
    const { data: user, error } = await supabase
      .from('user')
      .select('id, email, name, role, cooperativeId, createdAt')
      .eq('id', id)
      .is('deletedAt', null)
      .single();

    if (error || !user) throw new NotFoundError('User not found');
    return user;
  }

  async create(data) {
    const { data: existing } = await supabase
      .from('user')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existing) throw new ConflictError('Email already in use');

    const { data: user, error } = await supabase
      .from('user')
      .insert({
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role,
        cooperativeId: data.cooperativeId,
      })
      .select('id, email, name, role, cooperativeId, createdAt')
      .single();

    if (error) throw new Error(error.message);
    return user;
  }

  async update(id, data) {
    const { data: user, error } = await supabase
      .from('user')
      .update(data)
      .eq('id', id)
      .select('id, email, name, role, cooperativeId, createdAt')
      .single();

    if (error || !user) throw new NotFoundError('User not found');
    return user;
  }
}

export const cooperativeService = new CooperativeService();
export const memberService = new MemberService();
export const userService = new UserService();
