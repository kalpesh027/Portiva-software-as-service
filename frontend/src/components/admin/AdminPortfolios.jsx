import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../landing/landingUtils';
import apiClient from '../../services/apiClient';

const AdminPortfolios = ({ dark = false }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);

  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/portfolios?page=${page}&size=20`);
      setPortfolios(response?.content || []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to fetch portfolios');
      console.error('Portfolios error:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const bgCard = dark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = dark ? 'border-slate-700' : 'border-gray-200';
  const textMuted = dark ? 'text-slate-400' : 'text-gray-600';

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-yellow-600/20 text-yellow-300',
      'generating': 'bg-blue-600/20 text-blue-300',
      'published': 'bg-green-600/20 text-green-300',
      'unpublished': 'bg-gray-600/20 text-gray-300',
    };
    return colors[status] || colors['draft'];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Portfolio Management</h2>
        <button
          onClick={fetchPortfolios}
          className="px-4 py-2 rounded bg-violet-600 text-white hover:bg-violet-700"
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className={textMuted}>Loading portfolios...</div>
        </div>
      ) : error ? (
        <div className={cn('p-6 rounded-lg border', dark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')}>
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={fetchPortfolios}
            className="mt-2 px-3 py-1 text-sm rounded bg-red-600/20 hover:bg-red-600/30"
          >
            Retry
          </button>
        </div>
      ) : portfolios.length === 0 ? (
        <div className={cn('p-12 rounded-lg border text-center', bgCard, borderColor)}>
          <p className={textMuted}>No portfolios found</p>
        </div>
      ) : (
        <div className={cn('rounded-lg border overflow-hidden', bgCard, borderColor)}>
          <table className="w-full">
            <thead className={dark ? 'bg-slate-900' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Owner Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Template</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Views</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className={dark ? 'divide-y divide-slate-700' : 'divide-y divide-gray-200'}>
              {portfolios.map((portfolio) => (
                <tr key={portfolio.id} className={dark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-mono">{portfolio.slug}</td>
                  <td className="px-6 py-4 text-sm text-blue-500">
                    <a href={`mailto:${portfolio.ownerEmail}`} className="hover:underline">
                      {portfolio.ownerEmail}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm">{portfolio.templateName || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={cn('px-2 py-1 rounded text-xs font-semibold', getStatusColor(portfolio.status))}>
                      {portfolio.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{portfolio.viewCount || 0}</td>
                  <td className="px-6 py-4 text-sm">{new Date(portfolio.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <a
                      href={portfolio.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Live
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="px-4 py-2 rounded bg-gray-600/20 hover:bg-gray-600/30 disabled:opacity-50"
        >
          ← Previous
        </button>
        <span className={textMuted}>Page {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={portfolios.length < 20}
          className="px-4 py-2 rounded bg-gray-600/20 hover:bg-gray-600/30 disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      {/* Stats Summary */}
      <div className={cn('p-6 rounded-lg border', bgCard, borderColor)}>
        <h3 className="text-lg font-bold mb-4">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className={textMuted}>Published</p>
            <p className="text-2xl font-bold">{portfolios.filter(p => p.status === 'published').length}</p>
          </div>
          <div>
            <p className={textMuted}>Generating</p>
            <p className="text-2xl font-bold">{portfolios.filter(p => p.status === 'generating').length}</p>
          </div>
          <div>
            <p className={textMuted}>Draft</p>
            <p className="text-2xl font-bold">{portfolios.filter(p => p.status === 'draft').length}</p>
          </div>
          <div>
            <p className={textMuted}>Total Views</p>
            <p className="text-2xl font-bold">{portfolios.reduce((sum, p) => sum + (p.viewCount || 0), 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortfolios;
