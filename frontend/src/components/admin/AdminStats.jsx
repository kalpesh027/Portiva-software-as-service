import React, { useState, useEffect } from 'react';
import { cn } from '../landing/landingUtils';
import apiClient from '../../services/apiClient';

const StatCard = ({ icon, label, value, helper, accent = 'violet', dark }) => {
  const bgColor = dark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = dark ? 'border-slate-700' : 'border-slate-200';

  const accentStyles = {
    violet: {
      icon: dark
        ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
        : 'bg-linear-to-br from-violet-100 to-fuchsia-100 text-violet-700 border-violet-200',
      chip: dark ? 'text-violet-300 bg-violet-500/15' : 'text-violet-700 bg-violet-100',
    },
    cyan: {
      icon: dark
        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
        : 'bg-linear-to-br from-cyan-100 to-sky-100 text-cyan-700 border-cyan-200',
      chip: dark ? 'text-cyan-300 bg-cyan-500/15' : 'text-cyan-700 bg-cyan-100',
    },
    emerald: {
      icon: dark
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        : 'bg-linear-to-br from-emerald-100 to-lime-100 text-emerald-700 border-emerald-200',
      chip: dark ? 'text-emerald-300 bg-emerald-500/15' : 'text-emerald-700 bg-emerald-100',
    },
    amber: {
      icon: dark
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        : 'bg-linear-to-br from-amber-100 to-orange-100 text-amber-700 border-amber-200',
      chip: dark ? 'text-amber-300 bg-amber-500/15' : 'text-amber-700 bg-amber-100',
    },
  };

  const accentClass = accentStyles[accent] || accentStyles.violet;

  return (
    <div className={cn('p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5', bgColor, borderColor, !dark && 'shadow-sm hover:shadow-md')}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={cn('text-xs uppercase tracking-wide font-semibold', dark ? 'text-slate-400' : 'text-slate-500')}>
            {label}
          </p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <p className={cn('text-xs mt-2', dark ? 'text-slate-400' : 'text-slate-500')}>{helper}</p>
        </div>
        <div className={cn('w-11 h-11 rounded-xl border flex items-center justify-center', accentClass.icon)}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold', accentClass.chip)}>
          Live metric
        </span>
      </div>
    </div>
  );
};

const AdminStats = ({ dark = false }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/stats');
      setStats(response);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to fetch stats');
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-6 rounded-lg border', dark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')}>
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchStats}
          className="mt-2 px-3 py-1 text-sm rounded bg-red-600/20 hover:bg-red-600/30"
        >
          Retry
        </button>
      </div>
    );
  }

  const defaultStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalPortfolios: 0,
    publishedPortfolios: 0,
    totalViewsAllTime: 0,
    monthlyRecurringRevenue: 0,
    proSubscriptions: 0,
    totalRevenue: 0,
  };

  const data = stats || defaultStats;

  const cards = [
    {
      label: 'Total Users',
      value: data.totalUsers?.toLocaleString() || '0',
      helper: 'All registered accounts',
      accent: 'violet',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-8 0v2m8 0H7m5-10a4 4 0 100-8 4 4 0 000 8z" /></svg>,
    },
    {
      label: 'Active Users',
      value: data.activeUsers30d?.toLocaleString() || data.activeUsers?.toLocaleString() || '0',
      helper: 'Active in last 30 days',
      accent: 'cyan',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      label: 'Published Portfolios',
      value: data.publishedPortfolios?.toLocaleString() || '0',
      helper: 'Live portfolio pages',
      accent: 'emerald',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
    },
    {
      label: 'Total Portfolios',
      value: data.totalPortfolios?.toLocaleString() || '0',
      helper: 'Created portfolios',
      accent: 'amber',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
    },
    {
      label: 'Total Revenue',
      value: `₹${Math.round(data.totalRevenueInr ?? data.totalRevenue ?? 0).toLocaleString()}`,
      helper: 'All-time successful payments',
      accent: 'violet',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-3.314 0-6 1.343-6 3s2.686 3 6 3 6 1.343 6 3-2.686 3-6 3m0-12c3.314 0 6-1.343 6-3s-2.686-3-6-3-6 1.343-6 3 2.686 3 6 3z" /></svg>,
    },
    {
      label: 'Monthly Revenue',
      value: `₹${Math.round(data.monthlyRevenueInr ?? data.monthlyRecurringRevenue ?? 0).toLocaleString()}`,
      helper: 'Current month receipts',
      accent: 'cyan',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-9 4h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    },
    {
      label: 'Pro Subscriptions',
      value: data.planBreakdown?.pro?.toLocaleString() || data.proSubscriptions?.toLocaleString() || '0',
      helper: 'Active paid pro users',
      accent: 'emerald',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" /></svg>,
    },
    {
      label: 'Team Subscriptions',
      value: data.planBreakdown?.team?.toLocaleString() || '0',
      helper: 'Active team plan users',
      accent: 'amber',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-8 0v2m8 0H7" /></svg>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Platform Statistics</h2>
        <button
          onClick={fetchStats}
          className="px-4 py-2 text-sm rounded-xl bg-linear-to-r from-violet-600 to-violet-400 text-white font-semibold shadow-sm hover:shadow-md transition-all"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            helper={card.helper}
            accent={card.accent}
            dark={dark}
          />
        ))}
      </div>

      <div className={cn(
        'rounded-2xl border p-6',
        dark ? 'bg-slate-800/50 border-slate-700' : 'bg-linear-to-br from-violet-50 to-white border-violet-100 shadow-sm'
      )}>
        <h3 className="text-lg font-bold mb-2">Revenue Insight</h3>
        <p className={cn('text-sm mb-5', dark ? 'text-slate-400' : 'text-slate-600')}>
          Monthly vs total revenue snapshot for quick financial checks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={cn('rounded-xl p-4 border', dark ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-violet-100')}>
            <p className={cn('text-xs uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>Total Revenue</p>
            <p className="text-2xl font-bold mt-1">₹{Math.round(data.totalRevenueInr ?? data.totalRevenue ?? 0).toLocaleString()}</p>
          </div>
          <div className={cn('rounded-xl p-4 border', dark ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-violet-100')}>
            <p className={cn('text-xs uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>Current Month</p>
            <p className="text-2xl font-bold mt-1">₹{Math.round(data.monthlyRevenueInr ?? data.monthlyRecurringRevenue ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className={cn('rounded-2xl border p-6', dark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm')}>
        <h3 className="text-lg font-bold mb-2">Plan Mix</h3>
        <p className={cn('text-sm mb-5', dark ? 'text-slate-400' : 'text-slate-600')}>
          Current active user distribution by subscription type.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className={cn('rounded-xl border p-4', dark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50')}>
            <p className={cn('text-xs uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>Free</p>
            <p className="text-2xl font-bold mt-1">{(data.planBreakdown?.free ?? 0).toLocaleString()}</p>
          </div>
          <div className={cn('rounded-xl border p-4', dark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50')}>
            <p className={cn('text-xs uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>Pro</p>
            <p className="text-2xl font-bold mt-1">{(data.planBreakdown?.pro ?? 0).toLocaleString()}</p>
          </div>
          <div className={cn('rounded-xl border p-4', dark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50')}>
            <p className={cn('text-xs uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>Team</p>
            <p className="text-2xl font-bold mt-1">{(data.planBreakdown?.team ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
