import { supabase } from '../../utils/db.js';
import { ValidationError, LedgerError } from '../../utils/errors.js';

const LEDGER_ENTITIES = ['SavingsMutation', 'LoanPayment', 'WarehouseMutation'];

export class SyncService {
  async processBatch(items, user) {
    const results = [];
    for (const item of items) {
      const result = await this.processItem(item, user);
      results.push(result);
    }
    return { results };
  }

  async processItem(item, user) {
    // Check idempotency
    const { data: existing } = await supabase
      .from('idempotencyLedger')
      .select('*')
      .eq('idempotencyKey', item.idempotencyKey)
      .single();

    if (existing) {
      return {
        idempotencyKey: item.idempotencyKey,
        status: 'synced',
        serverId: existing.processedAt,
        conflictType: null,
        error: null,
      };
    }

    try {
      const { entityType, operationType, payload, clientId, deviceId } = item;
      const cooperativeId = user.cooperativeId;

      // Create outbox entry
      const { data: outboxEntry, error: outboxError } = await supabase
        .from('outbox')
        .insert({
          deviceId,
          entityType,
          operationType,
          clientId,
          payload,
          idempotencyKey: item.idempotencyKey,
          status: 'pending',
        })
        .select()
        .single();

      if (outboxError) throw new Error(outboxError.message);

      let serverId;
      let status = 'synced';

      switch (entityType) {
        case 'Member':
          serverId = await this.syncMember(operationType, payload, cooperativeId);
          break;
        case 'SavingsAccount':
          serverId = await this.syncSavingsAccount(operationType, payload, cooperativeId);
          break;
        case 'SavingsMutation':
          serverId = await this.syncSavingsMutation(operationType, payload, cooperativeId, user.id);
          break;
        case 'Loan':
          serverId = await this.syncLoan(operationType, payload, cooperativeId);
          break;
        case 'LoanPayment':
          serverId = await this.syncLoanPayment(operationType, payload, cooperativeId, user.id);
          break;
        case 'Product':
          serverId = await this.syncProduct(operationType, payload, cooperativeId);
          break;
        case 'Sale':
          serverId = await this.syncSale(operationType, payload, cooperativeId, user.id);
          break;
        case 'Purchase':
          serverId = await this.syncPurchase(operationType, payload, cooperativeId);
          break;
        default:
          throw new ValidationError(`Unknown entity type: ${entityType}`);
      }

      // Mark outbox as synced
      await supabase
        .from('outbox')
        .update({ status: 'synced' })
        .eq('id', outboxEntry.id);

      // Record idempotency
      await supabase
        .from('idempotencyLedger')
        .insert({ idempotencyKey: item.idempotencyKey, resultStatus: 'synced' });

      return {
        idempotencyKey: item.idempotencyKey,
        status,
        serverId,
        conflictType: null,
        error: null,
      };
    } catch (error) {
      return {
        idempotencyKey: item.idempotencyKey,
        status: 'rejected',
        serverId: null,
        conflictType: null,
        error: error.message,
      };
    }
  }

  async syncMember(operationType, payload, cooperativeId) {
    if (operationType === 'create') {
      const { data, error } = await supabase
        .from('member')
        .insert({
          cooperativeId,
          memberNumber: payload.memberNumber,
          nik: payload.nik,
          name: payload.name,
          phone: payload.phone,
          address: payload.address,
          status: payload.status || 'active',
        })
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id;
    }
    if (operationType === 'update') {
      const { data, error } = await supabase
        .from('member')
        .update(payload)
        .eq('id', payload.id)
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id;
    }
    if (operationType === 'delete') {
      await supabase
        .from('member')
        .update({ deletedAt: new Date().toISOString() })
        .eq('id', payload.id);
      return payload.id;
    }
  }

  async syncSavingsAccount(operationType, payload, cooperativeId) {
    if (operationType === 'create') {
      const { data, error } = await supabase
        .from('savingsAccount')
        .insert({
          memberId: payload.memberId,
          type: payload.type,
          status: payload.status || 'active',
        })
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id;
    }
  }

  async syncSavingsMutation(operationType, payload, cooperativeId, officerId) {
    if (operationType === 'create') {
      const { data, error } = await supabase
        .from('savingsMutation')
        .insert({
          savingsAccountId: payload.savingsAccountId,
          type: payload.type,
          amount: payload.amount,
          receiptNumber: payload.receiptNumber,
          description: payload.description,
          officerId,
          transactionDate: payload.transactionDate || new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id;
    }
    throw new LedgerError('SavingsMutation is append-only');
  }

  async syncLoan(operationType, payload, cooperativeId) {
    if (operationType === 'create') {
      const { data, error } = await supabase
        .from('loan')
        .insert({
          memberId: payload.memberId,
          principal: payload.principal,
          interestRate: payload.interestRate,
          tenorMonths: payload.tenorMonths,
          status: 'draft',
        })
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id;
    }
    if (operationType === 'update') {
      const { data, error } = await supabase
        .from('loan')
        .update(payload)
        .eq('id', payload.id)
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id;
    }
  }

  async syncLoanPayment(operationType, payload, cooperativeId, officerId) {
    if (operationType === 'create') {
      const { data, error } = await supabase
        .from('loanPayment')
        .insert({
          installmentScheduleId: payload.installmentScheduleId,
          amount: payload.amount,
          officerId,
          receiptNumber: payload.receiptNumber,
          paymentDate: payload.paymentDate || new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id;
    }
    throw new LedgerError('LoanPayment is append-only');
  }

  async syncProduct(operationType, payload, cooperativeId) {
    if (operationType === 'create') {
      const { data, error } = await supabase
        .from('product')
        .insert({
          cooperativeId,
          category: payload.category,
          name: payload.name,
          unit: payload.unit,
          purchasePrice: payload.purchasePrice,
          salePrice: payload.salePrice,
          barcode: payload.barcode,
          minimumStock: payload.minimumStock || 0,
        })
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id;
    }
    if (operationType === 'update') {
      const { data, error } = await supabase
        .from('product')
        .update(payload)
        .eq('id', payload.id)
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id;
    }
  }

  async syncSale(operationType, payload, cooperativeId, cashierId) {
    if (operationType === 'create') {
      const { data, error } = await supabase
        .from('sale')
        .insert({
          cooperativeId,
          cashierId,
          totalAmount: payload.totalAmount,
          paymentMethod: payload.paymentMethod || 'cash',
          status: 'completed',
          items: payload.items,
        })
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id;
    }
  }

  async syncPurchase(operationType, payload, cooperativeId) {
    if (operationType === 'create') {
      const { data, error } = await supabase
        .from('purchase')
        .insert({
          cooperativeId,
          supplierId: payload.supplierId,
          totalAmount: payload.totalAmount,
          paymentStatus: 'unpaid',
          items: payload.items,
        })
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id;
    }
  }

  async getStatus(clientId) {
    const { data, error } = await supabase
      .from('outbox')
      .select('*')
      .eq('clientId', clientId)
      .order('createdAt', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getConflicts() {
    const { data, error } = await supabase
      .from('conflictCase')
      .select('*')
      .eq('status', 'open')
      .order('createdAt', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async resolveConflict(conflictId, resolution, userId) {
    const { data, error } = await supabase
      .from('conflictCase')
      .update({
        status: 'resolved',
        resolution,
        resolvedBy: userId,
        resolvedAt: new Date().toISOString(),
      })
      .eq('id', conflictId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

export const syncService = new SyncService();
