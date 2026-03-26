import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { cn } from '../landing/landingUtils';
import { CiUser, CiSettings, CiLock,  CiCreditCard1} from "react-icons/ci";

const Settings = ({ dark = false }) => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: '',
        phone: '',
        location: '',
        website: ''
    });

    const [accountSettings, setAccountSettings] = useState({
        emailNotifications: true,
        portfolioPublic: true,
        showAnalytics: true,
        allowComments: false,
        customDomain: '',
        seoEnabled: true
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileChange = (field, value) => setProfileData(prev => ({ ...prev, [field]: value }));
    const handleAccountSettingChange = (field, value) => setAccountSettings(prev => ({ ...prev, [field]: value }));

    const handleSaveProfile = () => {
        setIsSaving(true);
        setTimeout(() => { setIsSaving(false); alert('Profile updated successfully!'); }, 1500);
    };

    const handleSaveAccountSettings = () => {
        setIsSaving(true);
        setTimeout(() => { setIsSaving(false); alert('Settings updated successfully!'); }, 1500);
    };

    const handleChangePassword = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) { alert('Passwords do not match!'); return; }
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            alert('Password changed successfully!');
        }, 1500);
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            alert('Account deletion initiated. You will receive a confirmation email.');
        }
    };

    // ── Theme tokens ─────────────────────────────────────────────────────────
    const t1       = dark ? 'text-white'      : 'text-gray-900';
    const t2       = dark ? 'text-slate-300'  : 'text-gray-600';
    const inputCls = cn('w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors',
        dark ? 'bg-[#1a2640] border-slate-700/60 text-white placeholder-slate-500 focus:ring-violet-500/30 focus:border-violet-500/50'
             : 'bg-white border-gray-200 text-gray-900 focus:ring-gray-300 focus:border-transparent');
    const labelCls  = cn('block text-sm font-medium mb-2', dark ? 'text-slate-300' : 'text-gray-700');
    const cardCls   = cn('border rounded-lg p-6', dark ? 'bg-[#131e30] border-slate-700/60' : 'bg-white border-gray-200');
    const dividerCls = cn('border-b', dark ? 'border-slate-700/60' : 'border-gray-100');
    const toggleCls  = cn(
        "w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4",
        dark ? 'bg-slate-700 peer-focus:ring-violet-500/30 peer-checked:bg-violet-600 after:border-slate-600'
             : 'bg-gray-200 peer-focus:ring-gray-300 peer-checked:bg-gray-900 after:border-gray-300'
    );
    const saveBtnCls = cn('px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 text-white',
        dark ? 'bg-violet-600 hover:bg-violet-500' : 'bg-gray-900 hover:bg-gray-800');
    const tabs = [
        { id: 'profile',  label: 'Profile',  icon: <CiUser className={dark ? 'text-white' : 'text-slate-600'} size={18} /> },
        { id: 'account',  label: 'Account',  icon: <CiSettings className={dark ? 'text-white' : 'text-slate-600'} size={20} /> },
        { id: 'security', label: 'Security', icon: <CiLock className={dark ? 'text-white' : 'text-slate-600'} size={20} /> },
        { id: 'billing',  label: 'Billing',  icon: <CiCreditCard1 className={dark ? 'text-white' : 'text-slate-600'} size={20} /> }
    ];

    // ── Tab renderers ─────────────────────────────────────────────────────────
    const renderProfileTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelCls}>Full Name</label>
                    <input type="text" value={profileData.name} onChange={(e) => handleProfileChange('name', e.target.value)} className={inputCls} placeholder="John Doe" />
                </div>
                <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" value={profileData.email} onChange={(e) => handleProfileChange('email', e.target.value)} className={inputCls} placeholder="john@example.com" />
                </div>
            </div>
            <div>
                <label className={labelCls}>Bio</label>
                <textarea value={profileData.bio} onChange={(e) => handleProfileChange('bio', e.target.value)} className={inputCls} rows="4" placeholder="Tell us about yourself..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelCls}>Phone Number</label>
                    <input type="tel" value={profileData.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} className={inputCls} placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                    <label className={labelCls}>Location</label>
                    <input type="text" value={profileData.location} onChange={(e) => handleProfileChange('location', e.target.value)} className={inputCls} placeholder="San Francisco, CA" />
                </div>
            </div>
            <div>
                <label className={labelCls}>Website</label>
                <input type="url" value={profileData.website} onChange={(e) => handleProfileChange('website', e.target.value)} className={inputCls} placeholder="https://yourwebsite.com" />
            </div>
            <button onClick={handleSaveProfile} disabled={isSaving} className={saveBtnCls}>
                {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
        </div>
    );

    const renderAccountTab = () => (
        <div className="space-y-6">
            <div className={cardCls}>
                <h3 className={cn('font-semibold mb-4', t1)}>Portfolio Settings</h3>
                {[
                    { key: 'portfolioPublic',    label: 'Make Portfolio Public', desc: 'Allow anyone to view your portfolio' },
                    { key: 'emailNotifications', label: 'Email Notifications',   desc: 'Receive updates about your portfolio' },
                    { key: 'showAnalytics',      label: 'Show Analytics',        desc: 'Display visitor stats on your dashboard' },
                    { key: 'seoEnabled',         label: 'SEO Optimization',      desc: 'Improve search engine visibility' },
                ].map((item, i, arr) => (
                    <div key={item.key} className={cn('flex items-center justify-between py-3', i < arr.length - 1 ? dividerCls : '')}>
                        <div>
                            <p className={cn('font-medium', t1)}>{item.label}</p>
                            <p className={cn('text-sm', t2)}>{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={accountSettings[item.key]} onChange={(e) => handleAccountSettingChange(item.key, e.target.checked)} className="sr-only peer" />
                            <div className={toggleCls}></div>
                        </label>
                    </div>
                ))}
            </div>
            <div className={cardCls}>
                <h3 className={cn('font-semibold mb-4', t1)}>Custom Domain</h3>
                <div className="space-y-3">
                    <input type="text" value={accountSettings.customDomain} onChange={(e) => handleAccountSettingChange('customDomain', e.target.value)} className={inputCls} placeholder="yourdomain.com" />
                    <p className={cn('text-sm', t2)}>Connect your own domain to your portfolio</p>
                </div>
            </div>
            <button onClick={handleSaveAccountSettings} disabled={isSaving} className={saveBtnCls}>
                {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
        </div>
    );

    const renderSecurityTab = () => (
        <div className="space-y-6">
            <div className={cardCls}>
                <h3 className={cn('font-semibold mb-4', t1)}>Change Password</h3>
                <div className="space-y-4">
                    <div><label className={labelCls}>Current Password</label><input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))} className={inputCls} placeholder="••••••••" /></div>
                    <div><label className={labelCls}>New Password</label><input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} className={inputCls} placeholder="••••••••" /></div>
                    <div><label className={labelCls}>Confirm New Password</label><input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} className={inputCls} placeholder="••••••••" /></div>
                    <button onClick={handleChangePassword} disabled={isSaving} className={saveBtnCls}>
                        {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
            <div className={cn('border rounded-lg p-6', dark ? 'bg-red-900/20 border-red-700/40' : 'bg-red-50 border-red-200')}>
                <h3 className={cn('font-semibold mb-2', dark ? 'text-red-400' : 'text-red-900')}>Danger Zone</h3>
                <p className={cn('text-sm mb-4', dark ? 'text-red-400/80' : 'text-red-700')}>Once you delete your account, there is no going back. Please be certain.</p>
                <button onClick={handleDeleteAccount} className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">Delete Account</button>
            </div>
        </div>
    );

    const renderBillingTab = () => (
        <div className="space-y-6">
            <div className={cardCls}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className={cn('font-semibold', t1)}>Current Plan</h3>
                        <p className={cn('text-sm', t2)}>You are currently on the Premium King plan</p>
                    </div>
                    <span className={cn('px-4 py-2 rounded-full text-sm font-semibold border', dark ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50' : 'bg-yellow-50 text-yellow-700 border-yellow-200')}>
                        Premium King
                    </span>
                </div>
                <div className={cn('space-y-3 border-t pt-4', dark ? 'border-slate-700/60' : 'border-gray-200')}>
                    {[
                        { label: 'Plan Amount',       val: '$29.99/month' },
                        { label: 'Next Billing Date', val: 'Feb 30, 2026' },
                        { label: 'Payment Method',    val: '•••• 4242' },
                    ].map(row => (
                        <div key={row.label} className="flex justify-between text-sm">
                            <span className={t2}>{row.label}</span>
                            <span className={cn('font-semibold', t1)}>{row.val}</span>
                        </div>
                    ))}
                </div>
                <button className={cn('mt-6 w-full py-3 rounded-lg font-semibold transition-all text-white', dark ? 'bg-violet-600 hover:bg-violet-500' : 'bg-gray-900 hover:bg-gray-800')}>
                    Manage Subscription
                </button>
            </div>
            <div className={cardCls}>
                <h3 className={cn('font-semibold mb-4', t1)}>Billing History</h3>
                <div className="space-y-3">
                    {[
                        { date: 'Jan 30, 2026', amount: '$29.99', status: 'Paid' },
                        { date: 'Dec 30, 2025', amount: '$29.99', status: 'Paid' },
                        { date: 'Nov 30, 2025', amount: '$29.99', status: 'Paid' },
                    ].map((invoice, idx) => (
                        <div key={idx} className={cn('flex items-center justify-between py-3 border-b last:border-0', dark ? 'border-slate-700/60' : 'border-gray-100')}>
                            <div>
                                <p className={cn('font-medium', t1)}>{invoice.amount}</p>
                                <p className={cn('text-sm', t2)}>{invoice.date}</p>
                            </div>
                            <span className="text-sm text-green-500 font-semibold">{invoice.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={cn('p-6 rounded-2xl border', dark ? 'bg-[#0f1829] border-slate-700/60' : 'bg-gray-50/50 border-gray-200/60')}>
                <h2 className={cn('text-2xl font-bold mb-2', t1)}>Settings</h2>
                <p className={t2}>Manage your account settings and preferences</p>
            </div>

            {/* Tabs */}
            <div className={cn('rounded-2xl border overflow-hidden', dark ? 'bg-[#0f1829] border-slate-700/60' : 'bg-gray-50/50 border-gray-200/60')}>
                <div className={cn('flex overflow-x-auto border-b', dark ? 'border-slate-700/60' : 'border-gray-200/60')}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-all duration-300 text-sm',
                                activeTab === tab.id
                                    ? (dark ? 'bg-[#131e30] text-white border-b-2 border-violet-500' : 'bg-white text-gray-900 border-b-2 border-gray-900')
                                    : (dark ? 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200' : 'text-gray-600 hover:bg-white/40')
                            )}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
                <div className={cn('p-6 min-h-[400px]', dark ? 'bg-[#131e30]' : 'bg-white')}>
                    {activeTab === 'profile'  && renderProfileTab()}
                    {activeTab === 'account'  && renderAccountTab()}
                    {activeTab === 'security' && renderSecurityTab()}
                    {activeTab === 'billing'  && renderBillingTab()}
                </div>
            </div>
        </div>
    );
};

export default Settings;
