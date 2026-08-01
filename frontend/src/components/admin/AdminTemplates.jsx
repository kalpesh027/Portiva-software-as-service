import React, { useState, useEffect } from 'react';
import { cn } from '../landing/landingUtils';
import apiClient from '../../services/apiClient';

const AdminTemplates = ({ dark = false }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/templates');
      setTemplates(response || []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to fetch templates');
      console.error('Templates error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name || '',
      description: template.description || '',
      isActive: template.isActive !== false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({ name: '', description: '', isActive: true });
  };

  const saveTemplate = async () => {
    try {
      if (!editingTemplate) return;
      await apiClient.put(`/admin/templates/${editingTemplate.id}`, formData);
      fetchTemplates();
      closeModal();
      alert('Template updated successfully');
    } catch (err) {
      alert('Failed to update template: ' + (err?.message || 'Unknown error'));
    }
  };

  const deleteTemplate = async (templateId) => {
    if (!window.confirm('Deactivate this template?')) return;
    
    try {
      await apiClient.delete(`/admin/templates/${templateId}`);
      fetchTemplates();
    } catch (err) {
      alert('Failed to delete template: ' + (err?.message || 'Unknown error'));
    }
  };

  const bgCard = dark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = dark ? 'border-slate-700' : 'border-gray-200';
  const textMuted = dark ? 'text-slate-400' : 'text-gray-600';
  const inputClass = cn('px-3 py-2 rounded border w-full', borderColor, dark ? 'bg-slate-900 text-white' : 'bg-white');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Template Management</h2>
        <button
          onClick={fetchTemplates}
          className="px-4 py-2 rounded bg-violet-600 text-white hover:bg-violet-700"
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className={textMuted}>Loading templates...</div>
        </div>
      ) : error ? (
        <div className={cn('p-6 rounded-lg border', dark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')}>
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={fetchTemplates}
            className="mt-2 px-3 py-1 text-sm rounded bg-red-600/20 hover:bg-red-600/30"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className={cn('p-4 rounded-lg border', bgCard, borderColor)}>
              <div className="aspect-video bg-gray-300/20 rounded mb-4 flex items-center justify-center">
                <span className="text-4xl">🎨</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{template.name}</h3>
              <p className={cn('text-sm mb-3', textMuted)}>{template.description}</p>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className={cn('px-2 py-1 rounded text-xs',
                  template.isActive
                    ? 'bg-green-600/20 text-green-300'
                    : 'bg-red-600/20 text-red-300'
                )}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={textMuted}>ID: {template.id?.substring(0, 8)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(template)}
                  className="flex-1 px-3 py-2 rounded text-sm bg-blue-600 hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="flex-1 px-3 py-2 rounded text-sm bg-red-600 hover:bg-red-700"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={cn('rounded-lg p-6 max-w-md w-full mx-4', bgCard)}>
            <h3 className="text-lg font-bold mb-4">Edit Template</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className={inputClass}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveTemplate}
                className="flex-1 px-4 py-2 rounded bg-green-600 hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 rounded bg-gray-600/20 hover:bg-gray-600/30"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemplates;
