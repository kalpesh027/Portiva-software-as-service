import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cn } from '../components/landing/landingUtils';
import AdminUsers from '../components/admin/AdminUsers';
import AdminPortfolios from '../components/admin/AdminPortfolios';
import AdminTemplates from '../components/admin/AdminTemplates';
import AdminStats from '../components/admin/AdminStats';
import AdminSettings from '../components/admin/AdminSettings';
import AdminPayments from '../components/admin/AdminPayments';
import { useTheme } from '../theme/ThemeContext';
import { logout } from '../features/auth/authSlice';
import { T } from '../components/landing/landingUtils';
import { CiCloudRainbow } from 'react-icons/ci';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dark, toggleDark } = useTheme();
  const t = T(dark);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=7C3AED&color=fff&size=128`;

  const navItems = [
    {
      key: 'stats',
      label: 'Platform Stats',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>,
    },
    {
      key: 'users',
      label: 'Users',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" /></svg>,
    },
    {
      key: 'portfolios',
      label: 'Portfolios',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      key: 'templates',
      label: 'Templates',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>,
    },
    {
      key: 'payments',
      label: 'Payments',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-9 4h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    },
    {
      key: 'settings',
      label: 'Platform Settings',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats dark={dark} />;
      case 'users':
        return <AdminUsers dark={dark} />;
      case 'portfolios':
        return <AdminPortfolios dark={dark} />;
      case 'templates':
        return <AdminTemplates dark={dark} />;
      case 'payments':
        return <AdminPayments dark={dark} />;
      case 'settings':
        return <AdminSettings dark={dark} />;
      default:
        return <AdminStats dark={dark} />;
    }
  };

  return (
    <div className={cn('flex h-screen font-sans transition-colors duration-300 overflow-hidden', dark ? 'bg-[#080e1a] text-white' : 'bg-slate-50 text-slate-900')}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r transition-all duration-300',
        'lg:relative lg:translate-x-0 lg:z-20',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        dark ? 'bg-[#0f1829] border-slate-700/60' : 'bg-white border-slate-200'
      )}>
        <div className={cn('px-6 py-5 border-b flex items-center gap-2', dark ? 'border-slate-700/60' : 'border-slate-200')}>
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-600 to-violet-400 flex items-center justify-center">
            <CiCloudRainbow size={22} className="text-white" />
          </div>
          <span className="font-black text-base tracking-tight">
            <span className={dark ? 'text-white' : 'text-slate-900'}>Portiva Admin</span>
          </span>
          <button
            className="ml-auto lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className={cn('p-5 border-b flex flex-col items-center', dark ? 'border-slate-700/60' : 'border-slate-200')}>
          <img
            src={userAvatar}
            alt="Admin"
            className="w-16 h-16 rounded-full shadow-lg ring-2 ring-violet-500/30"
          />
          <h3 className={cn('font-bold text-base text-center mt-3', t.textPrimary)}>{user?.name || 'Admin User'}</h3>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full mt-1 border', t.pillViolet)}>
            Admin Access
          </span>
        </div>

        <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                  isActive
                    ? 'bg-linear-to-br from-violet-600 to-violet-400 text-white shadow-lg shadow-violet-500/20'
                    : dark
                      ? 'text-slate-400 hover:bg-slate-700/40 hover:text-white'
                      : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                )}
              >
                <span className={isActive ? 'text-white' : (dark ? 'text-slate-400' : 'text-slate-500')}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className={cn('p-4 border-t space-y-2', dark ? 'border-slate-700/60' : 'border-slate-200')}>
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <header className={cn(
          'sticky top-0 z-10 px-4 py-4 flex justify-between items-center border-b backdrop-blur-lg transition-colors duration-300',
          dark ? 'bg-[#080e1a]/80 border-slate-700/60' : 'bg-white/80 border-slate-200'
        )}>
          <div className="flex items-center gap-3">
            <button
              className={cn(
                'lg:hidden p-2 rounded-xl border transition-all',
                dark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'
              )}
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className={cn('text-lg sm:text-xl font-bold capitalize', t.textPrimary)}>
              {navItems.find((n) => n.key === activeTab)?.label || activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleDark}
              className={cn(
                'p-2 rounded-xl border transition-all duration-200',
                dark
                  ? 'border-slate-700 bg-slate-800 text-amber-400 hover:border-amber-400/50'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-violet-300 hover:text-violet-600'
              )}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>

            <button
              onClick={() => navigate('/')}
              className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300/60 hover:border-violet-400/60 hover:text-violet-500 transition-all whitespace-nowrap"
            >
              View Landing
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
