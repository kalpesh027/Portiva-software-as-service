import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Analytics from '../components/dashboard/Analytics';
import Subscription from '../components/dashboard/Subscription';
import ManageTemplate from '../components/dashboard/ManageTemplate';
import EditContent from '../components/dashboard/EditContent';
import Settings from '../components/dashboard/Settings';
import { logout } from '../features/auth/authSlice';
import { loadDraftThunk } from '../features/portfolio/portfolioSlice';
import PortfolioService from '../services/portfolioService';
import { useTheme } from '../theme/ThemeContext';
import { cn, T } from '../components/landing/landingUtils';
import { CiCloudRainbow } from "react-icons/ci";

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('analytics');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [portfolio, setPortfolio] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const { dark, toggleDark } = useTheme();
    const t = T(dark);

    const dummyLink = "https://images.yourstory.com/cs/2/40f5f790c39f11ebab0b1583f8394132/unnamed-1629447814834.jpg?fm=png&auto=format&w=800&blur=500";

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const fetchDashboardData = async () => {
        try {
            const res = await PortfolioService.getMyPortfolio();
            const p = res?.portfolio;
            if (!p) return;
            setPortfolio(p);
            if (p.id) {
                const a = await PortfolioService.getAnalytics(p.id);
                setAnalytics(a);
            }
        } catch (_) {
            // No portfolio yet or network issue
        }
    };

    useEffect(() => {
        dispatch(loadDraftThunk());
        fetchDashboardData();
    }, [dispatch]);

    const renderContent = () => {
        switch(activeTab) {
            case 'analytics':    return <Analytics dark={dark} analytics={analytics} />;
            case 'subscription': return <Subscription dark={dark} />;
            case 'editContent':  return <EditContent dark={dark} portfolioId={portfolio?.id} />;
            case 'settings':     return <Settings dark={dark} />;
            case 'manageTemplate':
            default:             return <ManageTemplate dark={dark} portfolio={portfolio} onRefresh={fetchDashboardData} />;
        }
    };

    const liveUrl = portfolio?.slug
        ? `${window.location.origin}/${portfolio.slug}`
        : (portfolio?.liveUrl || '#');

    const navItems = [
        {
            key: 'analytics',
            label: 'Analytics',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>,
        },
        {
            key: 'manageTemplate',
            label: 'Manage Template',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" /></svg>,
        },
        {
            key: 'editContent',
            label: 'Edit Content',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
        },
        {
            key: 'subscription',
            label: 'Subscription',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        },
    ];

    return (
        <div className={cn('flex h-screen font-sans transition-colors duration-300 overflow-hidden', dark ? 'bg-[#080e1a] text-white' : 'bg-slate-50 text-slate-900')}>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                'fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r transition-all duration-300',
                'lg:relative lg:translate-x-0 lg:z-20',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                dark ? 'bg-[#0f1829] border-slate-700/60' : 'bg-white border-slate-200'
            )}>
                {/* Logo */}
                <div className={cn('px-6 py-5 border-b flex items-center gap-2', dark ? 'border-slate-700/60' : 'border-slate-200')}>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                        <CiCloudRainbow size={22} className="text-white"/>
                    </div>
                    <span className="font-black text-base tracking-tight">
                        <span className={dark ? 'text-white' : 'text-slate-900'}>Portiva</span>
                    </span>
                    {/* Close button on mobile */}
                    <button
                        className="ml-auto lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* User Profile */}
                <div className={cn('p-5 border-b flex flex-col items-center', dark ? 'border-slate-700/60' : 'border-slate-200')}>
                    <div className="relative mb-3 group cursor-pointer">
                        <img
                            src={dummyLink || user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=7C3AED&color=fff&size=128`}
                            alt="User"
                            className="w-16 h-16 rounded-full shadow-lg ring-2 ring-violet-500/30 transition-all duration-300"
                        />
                        <div className="absolute inset-0 rounded-full bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <div className={cn('absolute -top-1 -right-1 rounded-full p-1 shadow-md', dark ? 'bg-[#0f1829]' : 'bg-white')} title="Premium Plan">
                            <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className={cn('font-bold text-base text-center', t.textPrimary)}>{user?.name || 'Guest User'}</h3>
                    <div className="flex items-center mt-1">
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full flex items-center border', t.pillViolet)}>
                            <svg className="w-3 h-3 mr-1 fill-current" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                            Premium User
                        </span>
                    </div>
                </div>

                {/* Nav */}
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
                                        ? 'bg-gradient-to-br from-violet-600 to-violet-400 text-white shadow-lg shadow-violet-500/20'
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

                {/* Bottom */}
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

            {/* Main */}
            <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
                <header className={cn(
                    'sticky top-0 z-10 px-4 py-4 flex justify-between items-center border-b backdrop-blur-lg transition-colors duration-300',
                    dark ? 'bg-[#080e1a]/80 border-slate-700/60' : 'bg-white/80 border-slate-200'
                )}>
                    <div className="flex items-center gap-3">
                        {/* Hamburger — mobile only */}
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
                            {navItems.find(n => n.key === activeTab)?.label || activeTab}
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
                        <a
                            href={liveUrl}
                            target={liveUrl === '#' ? undefined : '_blank'}
                            rel={liveUrl === '#' ? undefined : 'noopener noreferrer'}
                            className="px-3 py-2 text-xs sm:text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                        >
                            View Live Site
                        </a>
                    </div>
                </header>
                <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
                    {user && user.emailVerified === false && (
                        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md shadow-sm mb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold">Email not verified!</p>
                                    <p className="text-sm">Please verify your email address to secure your account.</p>
                                </div>
                                <button className="bg-amber-500 text-white px-4 py-2 rounded-md justify-end font-semibold text-sm hover:bg-amber-600 transition-colors">
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    )}
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
