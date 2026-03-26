import React, { useState } from 'react';
import { cn } from '../landing/landingUtils';
import { FaUsers, FaEye } from "react-icons/fa";
import { MdOutlineContentPaste, MdMarkEmailRead } from "react-icons/md";
import { IoIosLink } from "react-icons/io";

const Analytics = ({ dark = false, analytics = null }) => {
    const [timeRange, setTimeRange] = useState('7days');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const timeRangeOptions = [
        { value: '24hours', label: 'Last 24 Hours' },
        { value: '7days',   label: 'Last 7 Days' },
        { value: '30days',  label: 'Last 30 Days' },
        { value: '90days',  label: 'Last 90 Days' }
    ];
    const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);

    const views = analytics?.views ?? 45678;
    const uniqueVisitors = analytics?.uniqueVisitors ?? 12459;
    const stats = {
        totalVisitors: uniqueVisitors.toLocaleString(),
        pageViews: views.toLocaleString(),
        bounceRate: '42.5%',
        avgSession: '3m 24s',
        growth: { visitors: '+12.5%', pageViews: '+8.3%', bounceRate: '-5.2%', avgSession: '+15.7%' }
    };

    const trafficSources = [
        { source: 'Direct',   visitors: '4,234', percentage: 34, color: '#6366f1' },
        { source: 'Search',   visitors: '3,892', percentage: 31, color: '#10b981' },
        { source: 'Social',   visitors: '2,486', percentage: 20, color: '#f59e0b' },
        { source: 'Referral', visitors: '1,847', percentage: 15, color: '#ec4899' }
    ];

    const topPages = [
        { page: '/home',    views: '15,432', time: '4m 12s' },
        { page: '/projects',views: '12,089', time: '5m 34s' },
        { page: '/about',   views: '8,567',  time: '2m 45s' },
        { page: '/contact', views: '5,234',  time: '1m 56s' },
        { page: '/blog',    views: '4,356',  time: '6m 23s' }
    ];

    const deviceBreakdown = [
        { device: 'Desktop', percentage: 58, count: '7,226' },
        { device: 'Mobile',  percentage: 35, count: '4,361' },
        { device: 'Tablet',  percentage:  7, count: '872'   }
    ];

    const topCountries = analytics?.countries
        ? Object.entries(analytics.countries).map(([country, count]) => ({
            country,
            display: '🌍',
            visitors: count.toLocaleString(),
            percentage: Math.round((count / Math.max(views, 1)) * 100)
        }))
        : [
            { country: 'United States', display: '🇺🇸', visitors: '4,234', percentage: 34 },
            { country: 'United Kingdom', display: '🇬🇧', visitors: '2,486', percentage: 20 },
            { country: 'Canada', display: '🇨🇦', visitors: '1,847', percentage: 15 },
            { country: 'Germany', display: '🇩🇪', visitors: '1,245', percentage: 10 },
            { country: 'India', display: '🇮🇳', visitors: '987', percentage: 8 }
        ];

    const recentActivity = [
        { action: 'New visitor from New York, US',       time: '2 mins ago',  type: 'visitor'    },
        { action: 'Portfolio viewed 5 times',             time: '5 mins ago',  type: 'view'       },
        { action: 'Contact form submitted',               time: '12 mins ago', type: 'form'       },
        { action: 'Project page shared on LinkedIn',      time: '25 mins ago', type: 'share'      },
        { action: 'New subscriber from newsletter',       time: '1 hour ago',  type: 'subscriber' }
    ];

    const textPrimary  = dark ? 'text-white'        : 'text-gray-900';
    const textSecond   = dark ? 'text-slate-300'    : 'text-gray-600';
    const textMuted    = dark ? 'text-slate-500'    : 'text-gray-500';
    const dropBg       = dark ? 'bg-[#131e30] border-slate-700/60' : 'bg-white border-gray-200';
    const hoverItem    = dark ? 'hover:bg-slate-700/50' : 'hover:bg-violet-50/50';
    const activeItem   = dark ? 'bg-violet-900/30 text-violet-300 font-semibold' : 'bg-violet-50 text-violet-700 font-semibold';
    const progressBg   = dark ? 'bg-slate-700'      : 'bg-gray-200';

    // stat card tints — keep accent, darken for dark mode
    const statCards = [
        {
            label: 'Total Visitors',  val: stats.totalVisitors, growth: stats.growth.visitors,
            accent: '#3b82f6',
            bg:   dark ? 'bg-blue-900/20 border-blue-700/40'  : 'bg-blue-50/50 border-blue-200/60',
            labelCls: dark ? 'text-blue-400' : 'text-blue-600',
            iconPath: 'M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z',
            iconCls: dark ? 'text-blue-400' : 'text-blue-500',
            desc: 'Unique visitors to your site'
        },
        {
            label: 'Page Views',      val: stats.pageViews,     growth: stats.growth.pageViews,
            accent: '#8b5cf6',
            bg:   dark ? 'bg-violet-900/20 border-violet-700/40' : 'bg-purple-50/50 border-purple-200/60',
            labelCls: dark ? 'text-violet-400' : 'text-purple-600',
            iconPath: 'M10 12a2 2 0 100-4 2 2 0 000 4z M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z',
            iconCls: dark ? 'text-violet-400' : 'text-purple-500',
            desc: 'Total page impressions'
        },
        {
            label: 'Bounce Rate',     val: stats.bounceRate,    growth: stats.growth.bounceRate,
            accent: '#f97316',
            bg:   dark ? 'bg-orange-900/20 border-orange-700/40' : 'bg-orange-50/50 border-orange-200/60',
            labelCls: dark ? 'text-orange-400' : 'text-orange-600',
            iconPath: 'M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z',
            iconCls: dark ? 'text-orange-400' : 'text-orange-500',
            desc: 'Lower is better'
        },
        {
            label: 'Avg Session',     val: stats.avgSession,    growth: stats.growth.avgSession,
            accent: '#10b981',
            bg:   dark ? 'bg-emerald-900/20 border-emerald-700/40' : 'bg-green-50/50 border-green-200/60',
            labelCls: dark ? 'text-emerald-400' : 'text-green-600',
            iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z',
            iconCls: dark ? 'text-emerald-400' : 'text-green-500',
            desc: 'Time spent on site'
        }
    ];

    const deviceColors = {
        Desktop: { bg: dark ? 'bg-blue-900/20 border-blue-700/40'    : 'bg-blue-50/50 border-blue-200/60',    text: dark ? 'text-blue-400'    : 'text-blue-600',    icon: dark ? 'text-blue-400'    : 'text-blue-500'    },
        Mobile:  { bg: dark ? 'bg-emerald-900/20 border-emerald-700/40' : 'bg-emerald-50/50 border-emerald-200/60', text: dark ? 'text-emerald-400' : 'text-emerald-600', icon: dark ? 'text-emerald-400' : 'text-emerald-500' },
        Tablet:  { bg: dark ? 'bg-amber-900/20 border-amber-700/40'   : 'bg-amber-50/50 border-amber-200/60',   text: dark ? 'text-amber-400'   : 'text-amber-600',   icon: dark ? 'text-amber-400'   : 'text-amber-500'   }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className={cn('text-2xl font-bold', textPrimary)}>Analytics Overview</h2>
                    <p className={cn('text-sm mt-1', textMuted)}>Track your portfolio performance and visitor insights</p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                        className={cn(
                            'px-4 py-2 pr-9 border rounded-xl font-medium text-sm shadow-sm hover:shadow-md focus:outline-none transition-all cursor-pointer inline-flex items-center gap-2 min-w-fit',
                            dark ? 'bg-[#131e30] border-slate-700/60 text-slate-200 hover:border-violet-500/40' : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        )}
                    >
                        {selectedOption.label}
                        <svg className={cn('w-4 h-4 transition-transform', isDropdownOpen ? 'rotate-180' : '', textMuted)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {isDropdownOpen && (
                        <div className={cn('absolute right-0 mt-2 w-44 rounded-2xl shadow-lg border py-1 z-10', dropBg)}>
                            {timeRangeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => { setTimeRange(option.value); setIsDropdownOpen(false); }}
                                    className={cn(
                                        'w-full text-left px-4 py-2.5 text-sm transition-colors',
                                        timeRange === option.value ? activeItem : cn(textSecond, hoverItem)
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div key={card.label} className={cn('border rounded-xl p-6 hover:shadow-lg transition-all', card.bg)}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={cn('text-sm font-medium', card.labelCls)}>{card.label}</span>
                            <span className="text-green-500 text-xs font-semibold bg-green-500/10 px-2 py-1 rounded-full">{card.growth}</span>
                        </div>
                        <div className={cn('text-3xl font-bold mb-1', textPrimary)}>{card.val}</div>
                        <div className={cn('flex items-center text-xs', textSecond)}>
                            <svg className={cn('w-4 h-4 mr-1 flex-shrink-0', card.iconCls)} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d={card.iconPath} clipRule="evenodd" />
                            </svg>
                            {card.desc}
                        </div>
                    </div>
                ))}
            </div>

            {/* Traffic & Device */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <div className={cn('border rounded-xl p-6', dark ? 'bg-indigo-900/20 border-indigo-700/40' : 'bg-indigo-50/50 border-indigo-200/60')}>
                    <h3 className={cn('text-lg font-bold mb-4 flex items-center', textPrimary)}>
                        <svg className={cn('w-5 h-5 mr-2', dark ? 'text-indigo-400' : 'text-indigo-600')} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Traffic Sources
                    </h3>
                    <div className="space-y-4">
                        {trafficSources.map((source, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={cn('text-sm font-medium', textPrimary)}>{source.source}</span>
                                    <span className={cn('text-sm', textSecond)}>{source.visitors} ({source.percentage}%)</span>
                                </div>
                                <div className={cn('w-full rounded-full h-2.5', progressBg)}>
                                    <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${source.percentage}%`, backgroundColor: source.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className={cn('border rounded-2xl p-6', dark ? 'bg-[#0f1829] border-slate-700/60' : 'bg-gradient-to-br from-slate-50 to-gray-50 border-gray-200')}>
                    <h3 className={cn('text-lg font-bold mb-5 flex items-center', textPrimary)}>
                        <svg className={cn('w-5 h-5 mr-2', textSecond)} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                        </svg>
                        Device Breakdown
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {deviceBreakdown.map((device) => {
                            const c = deviceColors[device.device];
                            return (
                                <div key={device.device} className={cn('border rounded-xl p-6 transition-all', c.bg)}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className={cn('text-sm font-medium block mb-1', c.text)}>{device.device}</span>
                                            <div className={cn('flex items-center text-xs', textSecond)}>
                                                <span className={cn('mr-1', c.icon)}>
                                                    {device.device === 'Desktop' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" /></svg>}
                                                    {device.device === 'Mobile' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" /></svg>}
                                                    {device.device === 'Tablet' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm4 14a1 1 0 100-2 1 1 0 000 2z" /></svg>}
                                                </span>
                                                {device.count} visitors
                                            </div>
                                        </div>
                                        <div className={cn('text-3xl font-bold', textPrimary)}>{device.percentage}%</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Pages & Countries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className={cn('border rounded-xl p-6', dark ? 'bg-teal-900/20 border-teal-700/40' : 'bg-teal-50/50 border-teal-200/60')}>
                    <h3 className={cn('text-lg font-bold mb-4 flex items-center', textPrimary)}>
                        <svg className={cn('w-5 h-5 mr-2', dark ? 'text-teal-400' : 'text-teal-600')} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        Top Pages
                    </h3>
                    <div className={cn('rounded-lg border overflow-hidden', dark ? 'bg-[#131e30] border-teal-900/40' : 'bg-white border-teal-100')}>
                        <table className="w-full">
                            <thead>
                                <tr className={cn('border-b', dark ? 'bg-teal-900/30 border-teal-800/60' : 'bg-teal-100/50 border-teal-200')}>
                                    <th className={cn('text-left px-4 py-3 text-xs font-semibold uppercase', dark ? 'text-teal-300' : 'text-teal-900')}>#</th>
                                    <th className={cn('text-left px-4 py-3 text-xs font-semibold uppercase', dark ? 'text-teal-300' : 'text-teal-900')}>Page</th>
                                    <th className={cn('text-right px-4 py-3 text-xs font-semibold uppercase', dark ? 'text-teal-300' : 'text-teal-900')}>Views</th>
                                    <th className={cn('text-right px-4 py-3 text-xs font-semibold uppercase', dark ? 'text-teal-300' : 'text-teal-900')}>Avg Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topPages.map((page, idx) => (
                                    <tr key={idx} className={cn('border-b last:border-b-0 transition-colors', dark ? 'border-teal-900/30 hover:bg-teal-900/20' : 'border-teal-50 hover:bg-teal-50/50')}>
                                        <td className="px-4 py-3">
                                            <span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold', dark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700')}>{idx + 1}</span>
                                        </td>
                                        <td className={cn('px-4 py-3 font-medium text-sm', textPrimary)}>{page.page}</td>
                                        <td className={cn('px-4 py-3 text-right font-semibold text-sm', dark ? 'text-teal-400' : 'text-teal-600')}>{page.views}</td>
                                        <td className={cn('px-4 py-3 text-right text-sm', textMuted)}>{page.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Geographic */}
                <div className={cn('border rounded-xl p-6', dark ? 'bg-amber-900/20 border-amber-700/40' : 'bg-amber-50/50 border-amber-200/60')}>
                    <h3 className={cn('text-lg font-bold mb-4 flex items-center', textPrimary)}>
                        <svg className={cn('w-5 h-5 mr-2', dark ? 'text-amber-400' : 'text-amber-600')} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                        </svg>
                        Geographic Distribution
                    </h3>
                    <div className="space-y-4">
                        {topCountries.map((country, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{country.display}</span>
                                        <span className={cn('font-medium text-sm', textPrimary)}>{country.country}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={cn('text-sm font-semibold', dark ? 'text-amber-400' : 'text-amber-600')}>{country.visitors}</span>
                                        <span className={cn('text-xs font-bold w-10 text-right', textMuted)}>{country.percentage}%</span>
                                    </div>
                                </div>
                                <div className={cn('w-full rounded-full h-2', progressBg)}>
                                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${country.percentage}%`, background: 'linear-gradient(90deg,#f59e0b,#d97706)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className={cn('border rounded-xl p-6', dark ? 'bg-violet-900/20 border-violet-700/40' : 'bg-violet-50/50 border-violet-200/60')}>
                <h3 className={cn('text-lg font-bold mb-4 flex items-center', textPrimary)}>
                    <svg className={cn('w-5 h-5 mr-2', dark ? 'text-violet-400' : 'text-violet-600')} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Recent Activity
                    <span className="ml-auto text-xs bg-green-500/15 text-green-500 px-2 py-1 rounded-full font-semibold">Live</span>
                </h3>
                <div className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                        <div key={idx} className={cn('flex items-start p-3 rounded-lg border', dark ? 'bg-[#131e30] border-violet-900/40' : 'bg-white border-violet-100')}>
                            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 text-base', dark ? 'bg-violet-900/50' : 'bg-violet-100')}>
                                {activity.type === 'visitor'    && <FaUsers className={dark ? 'text-white' : 'text-violet-600'} size={20} />}
                                {activity.type === 'view'       && <FaEye className={dark ? 'text-white' : 'text-violet-600'} size={20} />}
                                {activity.type === 'form'       && <MdOutlineContentPaste className={dark ? 'text-white' : 'text-violet-600'} size={20} />}
                                {activity.type === 'share'      && <IoIosLink className={dark ? 'text-white' : 'text-violet-600'} size={20} />}
                                {activity.type === 'subscriber' && <MdMarkEmailRead className={dark ? 'text-white' : 'text-violet-600'} size={20} />}
                            </div>
                            <div className="flex-1">
                                <p className={cn('text-sm', textPrimary)}>{activity.action}</p>
                                <p className={cn('text-xs mt-1', textMuted)}>{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
