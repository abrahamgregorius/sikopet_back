import { supabase } from '../../utils/db.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';

export class WarehouseService {
  async list(user) {
    let query = supabase
      .from('warehouse')
      .select('*')
      .is('deletedAt', null);

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async get(id) {
    const { data: warehouse, error } = await supabase
      .from('warehouse')
      .select('*')
      .eq('id', id)
      .is('deletedAt', null)
      .single();

    if (error || !warehouse) throw new NotFoundError('Warehouse not found');
    return warehouse;
  }

  async create(user, data) {
    const { data: warehouse, error } = await supabase
      .from('warehouse')
      .insert({ ...data, cooperativeId: user.cooperativeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return warehouse;
  }

  async update(id, data) {
    const { data: warehouse, error } = await supabase
      .from('warehouse')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return warehouse;
  }

  async getStock(id) {
    const { data: receipts, error: rError } = await supabase
      .from('goodsReceipt')
      .select('productId, quantity')
      .eq('warehouseId', id);

    if (rError) throw new Error(rError.message);

    const { data: mutations, error: mError } = await supabase
      .from('warehouseMutation')
      .select('productId, type, quantity')
      .eq('warehouseId', id);

    if (mError) throw new Error(mError.message);

    const stockMap = new Map();
    for (const r of receipts || []) {
      stockMap.set(r.productId, (stockMap.get(r.productId) || 0) + r.quantity);
    }
    for (const m of mutations || []) {
      const current = stockMap.get(m.productId) || 0;
      if (m.type === 'in') {
        stockMap.set(m.productId, current + m.quantity);
      } else if (m.type === 'out') {
        stockMap.set(m.productId, current - m.quantity);
      }
    }

    const { data: products } = await supabase
      .from('product')
      .select('*')
      .in('id', Array.from(stockMap.keys()));

    return (products || []).map(p => ({ ...p, quantity: stockMap.get(p.id) || 0 }));
  }

  async listRacks(warehouseId) {
    const { data, error } = await supabase
      .from('rackLocation')
      .select('*')
      .eq('warehouseId', warehouseId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async createRack(data) {
    const { data: rack, error } = await supabase
      .from('rackLocation')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return rack;
  }

  async createGoodsReceipt(data) {
    const { data: receipt, error } = await supabase
      .from('goodsReceipt')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return receipt;
  }

  async createTransfer(data) {
    const { data: mutation, error } = await supabase
      .from('warehouseMutation')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mutation;
  }

  async getMutations(warehouseId) {
    const { data, error } = await supabase
      .from('warehouseMutation')
      .select('*, product(*)')
      .eq('warehouseId', warehouseId)
      .order('mutationDate', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async listStockOpnames(user) {
    let query = supabase
      .from('stockOpname')
      .select('*, warehouse(*), officer(id, name)')
      .order('date', { ascending: false });

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('warehouse.cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getStockOpname(id) {
    const { data, error } = await supabase
      .from('stockOpname')
      .select('*, warehouse(*), officer(id, name), items(*, product(*))')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async createStockOpname(user, data) {
    const { data: opname, error } = await supabase
      .from('stockOpname')
      .insert({
        warehouseId: data.warehouseId,
        officerId: user.id,
        items: data.items,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return opname;
  }

  async submitStockOpname(id) {
    const { data, error } = await supabase
      .from('stockOpname')
      .update({ status: 'pending_review' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async approveStockOpname(id, userId) {
    if (userId.role !== 'ba') throw new ForbiddenError('Only BA can approve stock opnames');
    const { data, error } = await supabase
      .from('stockOpname')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async rejectStockOpname(id, userId) {
    if (userId.role !== 'ba') throw new ForbiddenError('Only BA can reject stock opnames');
    const { data, error } = await supabase
      .from('stockOpname')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

export const warehouseService = new WarehouseService();
