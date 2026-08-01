import React, { useState } from 'react';
import { cn } from '../landing/landingUtils';

const AdminSettings = ({ dark = false }) => {
  const [settings, setSettings] = useState({
    siteName: 'Portiva',
    maintenanceMode: false,
    emailNotifications: true,
    webhookUrl: 'https://your-domain.com/webhooks',
    apiRateLimit: 1000,
    maxFileSize: 10,
    enableSignups: true,
    requireEmailVerification: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
    setSaved(false);
  };

  const saveSettings = () => {
    // In production, this would save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const bgCard = dark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = dark ? 'border-slate-700' : 'border-gray-200';
  const inputClass = cn('px-3 py-2 rounded border w-full', borderColor, dark ? 'bg-slate-900 text-white' : 'bg-white');
  const labelClass = 'block text-sm font-semibold mb-2';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Platform Settings</h2>
        {saved && (
          <div className="px-3 py-2 rounded bg-green-600/20 text-green-300 text-sm">
            ✓ Settings saved successfully
          </div>
        )}
      </div>

      {/* General Settings */}
      <div className={cn('p-6 rounded-lg border', bgCard, borderColor)}>
        <h3 className="text-lg font-bold mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className={inputClass}
              placeholder="Site name"
            />
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-semibold">Maintenance Mode</span>
          </label>
          <p className="text-sm text-gray-500">
            When enabled, only admins can access the platform.
          </p>
        </div>
      </div>

      {/* Security & Access */}
      <div className={cn('p-6 rounded-lg border', bgCard, borderColor)}>
        <h3 className="text-lg font-bold mb-4">Security & Access</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableSignups}
              onChange={(e) => handleChange('enableSignups', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-semibold">Allow New Signups</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.requireEmailVerification}
              onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-semibold">Require Email Verification</span>
          </label>
          <div>
            <label className={labelClass}>API Rate Limit (per hour)</label>
            <input
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) => handleChange('apiRateLimit', parseInt(e.target.value))}
              className={inputClass}
              placeholder="Rate limit"
            />
          </div>
        </div>
      </div>

      {/* Upload Settings */}
      <div className={cn('p-6 rounded-lg border', bgCard, borderColor)}>
        <h3 className="text-lg font-bold mb-4">Upload Settings</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Max File Size (MB)</label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
              className={inputClass}
              placeholder="Max file size"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={cn('p-6 rounded-lg border', bgCard, borderColor)}>
        <h3 className="text-lg font-bold mb-4">Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-semibold">Email Notifications</span>
          </label>
          <div>
            <label className={labelClass}>Webhook URL</label>
            <input
              type="url"
              value={settings.webhookUrl}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              className={inputClass}
              placeholder="https://example.com/webhooks"
            />
          </div>
        </div>
      </div>

      {/* Backup & Maintenance */}
      <div className={cn('p-6 rounded-lg border', bgCard, borderColor)}>
        <h3 className="text-lg font-bold mb-4">Backup & Maintenance</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Database Backup</span>
            <button className="px-3 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-sm">
              Backup Now
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span>Clear Cache</span>
            <button className="px-3 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-sm">
              Clear Now
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span>Sync AI Engine</span>
            <button className="px-3 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-sm">
              Sync Now
            </button>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className={cn('p-6 rounded-lg border', bgCard, borderColor)}>
        <h3 className="text-lg font-bold mb-4">System Information</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-semibold">Version:</span> 1.0.0</p>
          <p><span className="font-semibold">Database:</span> PostgreSQL 16</p>
          <p><span className="font-semibold">Cache:</span> Redis 7</p>
          <p><span className="font-semibold">API:</span> Spring Boot 3.3.5</p>
          <p><span className="font-semibold">Frontend:</span> React 19 + Vite 7</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={saveSettings}
          className="px-6 py-3 rounded bg-violet-600 hover:bg-violet-700 font-semibold"
        >
          Save Settings
        </button>
        <button className="px-6 py-3 rounded bg-gray-600/20 hover:bg-gray-600/30 font-semibold">
          Reset to Defaults
        </button>
      </div>

      {/* Important Notes */}
      <div className={cn('p-4 rounded-lg border', dark ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200')}>
        <h4 className="font-semibold mb-2">⚠️ Important</h4>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Some settings require restarting the backend to take effect.</li>
          <li>Always backup your database before making critical changes.</li>
          <li>Maintenance mode will prevent all users (except admins) from accessing the platform.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSettings;
