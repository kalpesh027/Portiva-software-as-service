import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../landing/landingUtils';
import apiClient from '../../services/apiClient';

const AdminUsers = ({ dark = false }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', '20');
      if (search) params.append('search', search);
      
      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      setUsers(response?.content || []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to fetch users');
      console.error('Users error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      alert('Failed to delete user: ' + (err?.message || 'Unknown error'));
    }
  };

  const viewUserDetail = async (userId) => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      setSelectedUser(response);
      setShowModal(true);
    } catch {
      alert('Failed to load user details');
    }
  };

  const bgCard = dark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = dark ? 'border-slate-700' : 'border-gray-200';
  const textMuted = dark ? 'text-slate-400' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className={cn('px-4 py-2 rounded border', borderColor, dark ? 'bg-slate-900 text-white' : 'bg-white')}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className={textMuted}>Loading users...</div>
        </div>
      ) : error ? (
        <div className={cn('p-6 rounded-lg border', dark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')}>
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 px-3 py-1 text-sm rounded bg-red-600/20 hover:bg-red-600/30"
          >
            Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className={cn('p-12 rounded-lg border text-center', bgCard, borderColor)}>
          <p className={textMuted}>No users found</p>
        </div>
      ) : (
        <div className={cn('rounded-lg border overflow-hidden', bgCard, borderColor)}>
          <table className="w-full">
            <thead className={dark ? 'bg-slate-900' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Plan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Verified</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className={dark ? 'divide-y divide-slate-700' : 'divide-y divide-gray-200'}>
              {users.map((user) => (
                <tr key={user.id} className={dark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 text-sm">{user.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={cn('px-2 py-1 rounded text-xs font-semibold', 
                      user.plan === 'pro' 
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'bg-gray-600/20 text-gray-300'
                    )}>
                      {user.plan?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.role}</td>
                  <td className="px-6 py-4 text-sm">
                    {user.emailVerified ? '✅' : '❌'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => viewUserDetail(user.id)}
                      className="text-blue-500 hover:underline mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
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
          disabled={users.length < 20}
          className="px-4 py-2 rounded bg-gray-600/20 hover:bg-gray-600/30 disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={cn('rounded-lg p-6 max-w-md w-full mx-4', bgCard)}>
            <h3 className="text-lg font-bold mb-4">User Details</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold">ID:</span> {selectedUser.id}</p>
              <p><span className="font-semibold">Name:</span> {selectedUser.name || 'N/A'}</p>
              <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
              <p><span className="font-semibold">Plan:</span> {selectedUser.plan?.toUpperCase()}</p>
              <p><span className="font-semibold">Status:</span> {selectedUser.subscriptionStatus}</p>
              <p><span className="font-semibold">Portfolio:</span> {selectedUser.portfolioSlug || 'None'}</p>
              <p><span className="font-semibold">AI Gen Count:</span> {selectedUser.aiGenCount || 0}</p>
              <p><span className="font-semibold">Created:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              {selectedUser.deletedAt && (
                <p className="text-red-500"><span className="font-semibold">Deleted:</span> {new Date(selectedUser.deletedAt).toLocaleDateString()}</p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  deleteUser(selectedUser.id);
                }}
                className="flex-1 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete User
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded bg-gray-600/20 hover:bg-gray-600/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
