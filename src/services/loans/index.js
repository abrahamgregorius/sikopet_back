import { supabase } from '../../utils/db.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors.js';

export class LoanService {
  async list(user) {
    let query = supabase
      .from('loan')
      .select('*, member(*)');

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('member.cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async get(id) {
    const { data: loan, error } = await supabase
      .from('loan')
      .select('*, member(*), installments(*), payments(*)')
      .eq('id', id)
      .single();

    if (error || !loan) throw new NotFoundError('Loan not found');
    return loan;
  }

  async create(user, data) {
    const { data: loan, error } = await supabase
      .from('loan')
      .insert({ ...data, status: 'draft' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return loan;
  }

  async update(id, data) {
    const { data: existing } = await supabase
      .from('loan')
      .select('status')
      .eq('id', id)
      .single();

    if (!existing) throw new NotFoundError('Loan not found');
    if (!['draft', 'pending'].includes(existing.status)) {
      throw new ValidationError('Cannot update loan in current status');
    }

    const { data: loan, error } = await supabase
      .from('loan')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return loan;
  }

  async submit(id) {
    const { data: existing } = await supabase
      .from('loan')
      .select('status')
      .eq('id', id)
      .single();

    if (!existing) throw new NotFoundError('Loan not found');
    if (existing.status !== 'draft') throw new ValidationError('Can only submit draft loans');

    const { data: loan, error } = await supabase
      .from('loan')
      .update({ status: 'pending' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return loan;
  }

  async approve(id, userId, notes) {
    if (userId.role !== 'ba') throw new ForbiddenError('Only BA can approve loans');

    const { data: loan } = await supabase
      .from('loan')
      .select('*')
      .eq('id', id)
      .single();

    if (!loan) throw new NotFoundError('Loan not found');
    if (loan.status !== 'pending') throw new ValidationError('Can only approve pending loans');

    const totalAmount = loan.principal * (1 + loan.interestRate / 100);
    const monthlyAmount = totalAmount / loan.tenorMonths;

    const { data: loanUpdated, error } = await supabase
      .from('loan')
      .update({
        status: 'approved',
        approvedBy: userId.id,
        approvedAt: new Date().toISOString(),
        notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Generate installment schedule
    const installments = [];
    const startDate = new Date();
    for (let i = 1; i <= loan.tenorMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      installments.push({
        loanId: id,
        installmentNumber: i,
        dueDate: dueDate.toISOString(),
        amountDue: monthlyAmount,
      });
    }

    await supabase.from('installmentSchedule').insert(installments);

    return loanUpdated;
  }

  async reject(id, userId, notes) {
    if (userId.role !== 'ba') throw new ForbiddenError('Only BA can reject loans');

    const { data: loan } = await supabase
      .from('loan')
      .select('status')
      .eq('id', id)
      .single();

    if (!loan) throw new NotFoundError('Loan not found');
    if (loan.status !== 'pending') throw new ValidationError('Can only reject pending loans');

    const { data: updated, error } = await supabase
      .from('loan')
      .update({ status: 'rejected', notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  }

  async pendingApproval() {
    const { data, error } = await supabase
      .from('loan')
      .select('*, member(*)')
      .eq('status', 'pending')
      .order('createdAt', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async overdue() {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('loan')
      .select('*, member(*)')
      .eq('status', 'active');

    if (error) throw new Error(error.message);

    // Filter overdue in application layer
    const overdue = [];
    for (const loan of data || []) {
      const { data: installments } = await supabase
        .from('installmentSchedule')
        .select('*')
        .eq('loanId', loan.id)
        .eq('status', 'unpaid')
        .lt('dueDate', now);

      if (installments?.length > 0) {
        overdue.push(loan);
      }
    }
    return overdue;
  }

  async disburse(id, data) {
    const { data: loan } = await supabase
      .from('loan')
      .select('status')
      .eq('id', id)
      .single();

    if (!loan) throw new NotFoundError('Loan not found');
    if (loan.status !== 'approved') throw new ValidationError('Can only disburse approved loans');

    const { data: updated, error } = await supabase
      .from('loan')
      .update({
        status: 'active',
        disbursementDate: new Date(data.disbursementDate || Date.now()).toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  }

  async getSchedule(id) {
    const { data, error } = await supabase
      .from('installmentSchedule')
      .select('*, payments(*)')
      .eq('loanId', id)
      .order('installmentNumber', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async recordPayment(loanId, data, officerId) {
    const { data: payment, error } = await supabase
      .from('loanPayment')
      .insert({
        installmentScheduleId: data.installmentScheduleId,
        amount: data.amount,
        officerId,
        receiptNumber: data.receiptNumber,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return payment;
  }
}

export class DepositService {
  async list(user) {
    let query = supabase
      .from('deposit')
      .select('*, member(*)');

    if (user.role !== 'pmo' && user.role !== 'admin') {
      query = query.eq('member.cooperativeId', user.cooperativeId);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async create(data) {
    const { data: deposit, error } = await supabase
      .from('deposit')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return deposit;
  }
}

export const loanService = new LoanService();
export const depositService = new DepositService();
