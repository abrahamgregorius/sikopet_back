import { supabase } from '../../utils/db.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export class SavingsService {
  async listAccounts(user) {
    let query = supabase
      .from('savingsAccount')
      .select('*, member(*)');

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('member.cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getAccountByMember(memberId) {
    const { data, error } = await supabase
      .from('savingsAccount')
      .select('*')
      .eq('memberId', memberId)
      .eq('status', 'active');

    if (error) throw new Error(error.message);
    return data || [];
  }

  async createAccount(data) {
    const { data: account, error } = await supabase
      .from('savingsAccount')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return account;
  }

  async deposit(data, officerId) {
    const { data: account } = await supabase
      .from('savingsAccount')
      .select('*')
      .eq('id', data.savingsAccountId)
      .single();

    if (!account) throw new NotFoundError('Savings account not found');
    if (account.status !== 'active') throw new ValidationError('Account is not active');

    const { data: mutation, error } = await supabase
      .from('savingsMutation')
      .insert({
        savingsAccountId: data.savingsAccountId,
        type: 'deposit',
        amount: data.amount,
        receiptNumber: data.receiptNumber,
        description: data.description,
        officerId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mutation;
  }

  async withdraw(data, officerId) {
    const { data: account } = await supabase
      .from('savingsAccount')
      .select('*, savingsMutation(*)')
      .eq('id', data.savingsAccountId)
      .single();

    if (!account) throw new NotFoundError('Savings account not found');
    if (account.status !== 'active') throw new ValidationError('Account is not active');

    const balance = account.savingsMutation.reduce((bal, m) => {
      return m.type === 'deposit' ? bal + m.amount : bal - m.amount;
    }, 0);

    if (balance < data.amount) {
      throw new ValidationError('Insufficient balance');
    }

    const { data: mutation, error } = await supabase
      .from('savingsMutation')
      .insert({
        savingsAccountId: data.savingsAccountId,
        type: 'withdrawal',
        amount: data.amount,
        receiptNumber: data.receiptNumber,
        description: data.description,
        officerId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mutation;
  }

  async getTransactions(accountId) {
    const { data, error } = await supabase
      .from('savingsMutation')
      .select('*, officer(id, name)')
      .eq('savingsAccountId', accountId)
      .order('transactionDate', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export const savingsService = new SavingsService();
