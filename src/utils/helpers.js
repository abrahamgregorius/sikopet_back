import { randomUUID } from 'crypto';

export function generateId() {
  return randomUUID();
}

export function calculateBalance(mutations) {
  return mutations.reduce((balance, mutation) => {
    return mutation.type === 'deposit'
      ? balance + BigInt(mutation.amount)
      : balance - BigInt(mutation.amount);
  }, BigInt(0));
}

export function buildPaginationQuery(page = 1, limit = 20) {
  const take = Math.min(Math.max(limit, 1), 100);
  const skip = (Math.max(page, 1) - 1) * take;
  return { take, skip };
}

export function buildPaginatedResponse(data, total, page, limit) {
  const take = Math.min(Math.max(limit, 1), 100);
  return {
    data,
    pagination: {
      page,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
}
