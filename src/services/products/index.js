import { supabase } from '../../utils/db.js';
import { NotFoundError } from '../../utils/errors.js';

export class ProductService {
  async list(user) {
    let query = supabase
      .from('product')
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
    const { data: product, error } = await supabase
      .from('product')
      .select('*')
      .eq('id', id)
      .is('deletedAt', null)
      .single();

    if (error || !product) throw new NotFoundError('Product not found');
    return product;
  }

  async getByBarcode(barcode) {
    const { data: product, error } = await supabase
      .from('product')
      .select('*')
      .eq('barcode', barcode)
      .is('deletedAt', null)
      .single();

    if (error || !product) throw new NotFoundError('Product not found');
    return product;
  }

  async create(user, data) {
    const { data: product, error } = await supabase
      .from('product')
      .insert({ ...data, cooperativeId: user.cooperativeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return product;
  }

  async update(id, data) {
    const { data: product, error } = await supabase
      .from('product')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return product;
  }

  async lowStock(user) {
    let query = supabase
      .from('product')
      .select('*')
      .is('deletedAt', null)
      .gt('minimumStock', 0);

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('cooperativeId', user.cooperativeId);
    }

    const { data: products, error } = await query;
    if (error) throw new Error(error.message);

    const lowStock = [];
    for (const product of products || []) {
      const { data: stockData } = await supabase
        .from('stock')
        .select('quantity')
        .eq('productId', product.id);

      const currentStock = stockData?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;
      if (currentStock < product.minimumStock) {
        lowStock.push({ ...product, currentStock });
      }
    }
    return lowStock;
  }
}

export class SupplierService {
  async list(user) {
    let query = supabase
      .from('supplier')
      .select('*')
      .is('deletedAt', null);

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async create(user, data) {
    const { data: supplier, error } = await supabase
      .from('supplier')
      .insert({ ...data, cooperativeId: user.cooperativeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return supplier;
  }
}

export class StockService {
  async list(user) {
    let query = supabase
      .from('stock')
      .select('*, product(*)');

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('product.cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  async get(productId) {
    const { data, error } = await supabase
      .from('stock')
      .select('*')
      .eq('productId', productId);

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export class SaleService {
  async list(user) {
    let query = supabase
      .from('sale')
      .select('*, items(*, product(*))')
      .order('date', { ascending: false });

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  async get(id) {
    const { data: sale, error } = await supabase
      .from('sale')
      .select('*, items(*, product(*))')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return sale;
  }

  async create(user, data) {
    const { data: sale, error } = await supabase
      .from('sale')
      .insert({
        cooperativeId: user.cooperativeId,
        cashierId: user.id,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod || 'cash',
        items: data.items,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return sale;
  }

  async oversell() {
    const { data, error } = await supabase
      .from('sale')
      .select('*')
      .eq('status', 'flagged');

    if (error) throw new Error(error.message);
    return data || [];
  }

  async resolveOversell(id) {
    const { data, error } = await supabase
      .from('sale')
      .update({ status: 'resolved' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

export class PurchaseService {
  async list(user) {
    let query = supabase
      .from('purchase')
      .select('*, supplier(*), items(*, product(*))')
      .order('date', { ascending: false });

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  async create(user, data) {
    const { data: purchase, error } = await supabase
      .from('purchase')
      .insert({
        cooperativeId: user.cooperativeId,
        supplierId: data.supplierId,
        totalAmount: data.totalAmount,
        items: data.items,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return purchase;
  }
}

export const productService = new ProductService();
export const supplierService = new SupplierService();
export const stockService = new StockService();
export const saleService = new SaleService();
export const purchaseService = new PurchaseService();
