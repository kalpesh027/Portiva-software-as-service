import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '../landing/landingUtils';
import apiClient from '../../services/apiClient';

const statusStyles = {
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  created: 'bg-amber-100 text-amber-700 border-amber-200',
  failed: 'bg-rose-100 text-rose-700 border-rose-200',
};

const statusStylesDark = {
  paid: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  created: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  failed: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const formatCurrencyInr = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

const trimId = (value) => {
  if (!value) return 'N/A';
  if (value.length <= 14) return value;
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
};

export default function AdminPayments({ dark = false }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('size', '20');
      if (status) params.append('status', status);
      if (plan) params.append('plan', plan);
      if (search) params.append('search', search);

      const response = await apiClient.get(`/admin/payments?${params.toString()}`);
      setPayments(response?.content || []);
      setHasNextPage(!(response?.last ?? true));
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, [page, status, plan, search]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const summary = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'paid');
    const failed = payments.filter((p) => p.status === 'failed');
    const pending = payments.filter((p) => p.status === 'created');
    const totalInr = paid.reduce((sum, p) => sum + Number(p.amountInr || 0), 0);

    return {
      paidCount: paid.length,
      failedCount: failed.length,
      pendingCount: pending.length,
      totalInr,
    };
  }, [payments]);

  const cardBase = dark
    ? 'bg-slate-800/50 border-slate-700'
    : 'bg-white border-slate-200 shadow-sm';

  const filterClass = cn(
    'px-3 py-2 rounded-xl border text-sm transition-colors',
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Payments</h2>
        <button
          onClick={fetchPayments}
          className="px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-violet-400 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={cn('rounded-2xl border p-4', cardBase)}>
          <p className={cn('text-xs uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>Paid Orders</p>
          <p className="text-2xl font-bold mt-1">{summary.paidCount}</p>
        </div>
        <div className={cn('rounded-2xl border p-4', cardBase)}>
          <p className={cn('text-xs uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>Pending</p>
          <p className="text-2xl font-bold mt-1">{summary.pendingCount}</p>
        </div>
        <div className={cn('rounded-2xl border p-4', cardBase)}>
          <p className={cn('text-xs uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>Failed</p>
          <p className="text-2xl font-bold mt-1">{summary.failedCount}</p>
        </div>
        <div className={cn('rounded-2xl border p-4', cardBase)}>
          <p className={cn('text-xs uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>Revenue (Page)</p>
          <p className="text-2xl font-bold mt-1">{formatCurrencyInr(summary.totalInr)}</p>
        </div>
      </div>

      <div className={cn('rounded-2xl border p-4 sm:p-5', cardBase)}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className={filterClass}
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="created">Created</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={plan}
            onChange={(e) => {
              setPlan(e.target.value);
              setPage(0);
            }}
            className={filterClass}
          >
            <option value="">All Plans</option>
            <option value="pro">Pro</option>
            <option value="team">Team</option>
          </select>

          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by email/order/payment id"
            className={filterClass}
          />

          <button
            onClick={() => {
              setSearch(searchInput.trim());
              setPage(0);
            }}
            className={cn(
              'rounded-xl text-sm font-semibold px-3 py-2 transition-all',
              dark ? 'bg-violet-500/20 text-violet-200 hover:bg-violet-500/30' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
            )}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className={cn('rounded-2xl border p-12 text-center', cardBase)}>
          <p className={dark ? 'text-slate-400' : 'text-slate-500'}>Loading payment history...</p>
        </div>
      ) : error ? (
        <div className={cn('rounded-2xl border p-6', dark ? 'bg-rose-900/20 border-rose-700' : 'bg-rose-50 border-rose-200')}>
          <p className="text-rose-600 text-sm">{error}</p>
        </div>
      ) : payments.length === 0 ? (
        <div className={cn('rounded-2xl border p-12 text-center', cardBase)}>
          <p className={dark ? 'text-slate-400' : 'text-slate-500'}>No payments found for current filters.</p>
        </div>
      ) : (
        <div className={cn('rounded-2xl border overflow-hidden', cardBase)}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-225">
              <thead className={dark ? 'bg-slate-900/70' : 'bg-slate-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Order Id</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Payment Id</th>
                </tr>
              </thead>
              <tbody className={dark ? 'divide-y divide-slate-700/80' : 'divide-y divide-slate-200'}>
                {payments.map((payment) => {
                  const badgeCls = dark
                    ? (statusStylesDark[payment.status] || 'bg-slate-500/20 text-slate-300 border-slate-500/30')
                    : (statusStyles[payment.status] || 'bg-slate-100 text-slate-700 border-slate-200');

                  return (
                    <tr key={payment.id} className={dark ? 'hover:bg-slate-800/40' : 'hover:bg-violet-50/30'}>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">{payment.userEmail || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                          dark ? 'bg-violet-500/20 text-violet-200 border-violet-500/30' : 'bg-violet-100 text-violet-700 border-violet-200'
                        )}>
                          {(payment.plan || 'N/A').toUpperCase()} / {(payment.billingPeriod || 'N/A').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatCurrencyInr(payment.amountInr)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', badgeCls)}>
                          {(payment.status || 'unknown').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono" title={payment.razorpayOrderId || ''}>{trimId(payment.razorpayOrderId)}</td>
                      <td className="px-4 py-3 text-sm font-mono" title={payment.razorpayPaymentId || ''}>{trimId(payment.razorpayPaymentId)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className={cn(
            'px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed',
            dark ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          )}
        >
          Previous
        </button>
        <span className={cn('text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>Page {page + 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNextPage}
          className={cn(
            'px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed',
            dark ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}
