import { supabase } from '../../utils/db.js';

export class DashboardService {
  async summary(user) {
    let coopFilter = {};
    if (user.role !== 'pmo' && user.role !== 'admin') {
      coopFilter = { cooperativeId: user.cooperativeId };
    }

    const [
      memberCount,
      activeLoanData,
      pendingApprovalData,
      overdueData
    ] = await Promise.all([
      supabase.from('member').select('id', { count: 'exact', head: true }).eq('status', 'active').match(coopFilter),
      supabase.from('loan').select('principal').eq('status', 'active').match(coopFilter),
      supabase.from('loan').select('id', { count: 'exact', head: true }).eq('status', 'pending').match(coopFilter),
      supabase.from('loan').select('id', { count: 'exact', head: true }).eq('status', 'active').match(coopFilter),
    ]);

    // Calculate total principal
    const { data: loans } = await supabase
      .from('loan')
      .select('principal')
      .eq('status', 'active')
      .match(coopFilter);

    const totalLoanPrincipal = loans?.reduce((sum, l) => sum + (l.principal || 0), 0) || 0;

    // Count overdue - simplified
    const { data: activeLoans } = await supabase
      .from('loan')
      .select('id')
      .eq('status', 'active')
      .match(coopFilter);

    let overdueCount = 0;
    if (activeLoans) {
      const now = new Date().toISOString();
      for (const loan of activeLoans) {
        const { data: installments } = await supabase
          .from('installmentSchedule')
          .select('id')
          .eq('loanId', loan.id)
          .eq('status', 'unpaid')
          .lt('dueDate', now);

        if (installments?.length > 0) overdueCount++;
      }
    }

    return {
      memberCount: memberCount.count || 0,
      activeLoanCount: activeLoanData.data?.length || 0,
      totalLoanPrincipal,
      pendingApprovalCount: pendingApprovalData.count || 0,
      overdueCount,
    };
  }

  async pmoCooperatives() {
    const { data, error } = await supabase
      .from('cooperative')
      .select('*, member:member(count), user:user(count)');

    if (error) throw new Error(error.message);
    return data || [];
  }

  async baConflicts() {
    const { data, error } = await supabase
      .from('conflictCase')
      .select('*')
      .eq('status', 'open')
      .order('createdAt', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getLatestRules() {
    const { data, error } = await supabase
      .from('ruleSet')
      .select('*')
      .order('version', { ascending: false })
      .limit(1);

    if (error) throw new Error(error.message);
    return data?.[0] || null;
  }
}

export class NotificationService {
  async list(user) {
    const { data, error } = await supabase
      .from('notification')
      .select('*')
      .or(`cooperativeId.eq.${user.cooperativeId},recipientRole.eq.${user.role},cooperativeId.is.null`)
      .order('createdAt', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async markRead(id) {
    const { data, error } = await supabase
      .from('notification')
      .update({ readAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

export const dashboardService = new DashboardService();
export const notificationService = new NotificationService();
