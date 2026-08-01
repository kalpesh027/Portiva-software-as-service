import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '../landing/landingUtils';
import SubscriptionService from '../../services/subscriptionService';


const Check = ({ cls = 'text-green-500' }) => (
    <svg className={cn('w-4 h-4 flex-shrink-0', cls)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
);
const Cross = () => (
    <svg className="w-4 h-4 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const StatusBadge = ({ status }) => {
    const map = {
        active:    'bg-green-500/10  text-green-500  border-green-500/30',
        trial:     'bg-amber-500/10  text-amber-500  border-amber-500/30',
        expired:   'bg-red-500/10    text-red-500    border-red-500/30',
        cancelled: 'bg-slate-500/10  text-slate-400  border-slate-500/30',
        failed:    'bg-red-600/10    text-red-400    border-red-600/30',
        pending:   'bg-blue-500/10   text-blue-400   border-blue-500/30',
    };
    return (
        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', map[status] ?? map.active)}>
            {status}
        </span>
    );
};

// ── plan data ─────────────────────────────────────────────────────────────────
const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        desc: 'Perfect for exploring the platform.',
        monthly: 0,
        yearly: 0,
        color: 'blue',
        features: {
            'Portfolio websites':      '1',
            'Premium templates':       false,
            'Custom domain':           false,
            'AI content generation':   '5 / mo',
            'Analytics dashboard':     'Basic',
            'Blog functionality':      false,
            'Custom branding removal': false,
            'SEO optimization tools':  false,
            'Priority support':        false,
            'Team members':            false,
        },
    },
    {
        id: 'pro',
        name: 'Pro',
        desc: 'For serious professionals who want it all.',
        monthly: 12,
        yearly: 9,
        color: 'violet',
        badge: 'Most Popular',
        features: {
            'Portfolio websites':      '5',
            'Premium templates':       true,
            'Custom domain':           true,
            'AI content generation':   '100 / mo',
            'Analytics dashboard':     'Advanced',
            'Blog functionality':      true,
            'Custom branding removal': true,
            'SEO optimization tools':  true,
            'Priority support':        true,
            'Team members':            false,
        },
    },
    {
        id: 'king',
        name: 'Premium King',
        desc: 'For agencies and high-growth teams.',
        monthly: 29,
        yearly: 22,
        color: 'amber',
        badge: 'Best Value',
        features: {
            'Portfolio websites':      'Unlimited',
            'Premium templates':       true,
            'Custom domain':           true,
            'AI content generation':   'Unlimited',
            'Analytics dashboard':     'Advanced + Export',
            'Blog functionality':      true,
            'Custom branding removal': true,
            'SEO optimization tools':  true,
            'Priority support':        'Dedicated',
            'Team members':            '10',
        },
    },
];

const FEATURE_KEYS = [
    'Portfolio websites',
    'Premium templates',
    'Custom domain',
    'AI content generation',
    'Analytics dashboard',
    'Blog functionality',
    'Custom branding removal',
    'SEO optimization tools',
    'Priority support',
    'Team members',
];

const INVOICES = [
    { id: 'INV-2026-03', date: 'Mar 1, 2026', amount: '$29.99', status: 'Paid', plan: 'Premium King' },
    { id: 'INV-2026-02', date: 'Feb 1, 2026', amount: '$29.99', status: 'Paid', plan: 'Premium King' },
    { id: 'INV-2026-01', date: 'Jan 1, 2026', amount: '$29.99', status: 'Paid', plan: 'Premium King' },
    { id: 'INV-2025-12', date: 'Dec 1, 2025', amount: '$29.99', status: 'Paid', plan: 'Premium King' },
    { id: 'INV-2025-11', date: 'Nov 1, 2025', amount: '$12.00', status: 'Paid', plan: 'Pro'          },
];

// ── component ─────────────────────────────────────────────────────────────────
const Subscription = ({ dark = false }) => {
    const [billing, setBilling]           = useState('monthly');
    const [currentPlan, setCurrentPlan]   = useState('king');
    const [subStatus, setSubStatus]       = useState('active');
    const [expiresAt, setExpiresAt]       = useState('');
    const [apiPlans, setApiPlans]         = useState([]);
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showInvoices, setShowInvoices] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    useEffect(() => {
        const loadSubscriptionData = async () => {
            setLoading(true);
            setError('');
            try {
                const [statusRes, plansRes] = await Promise.all([
                    SubscriptionService.getStatus(),
                    SubscriptionService.getPlans(),
                ]);

                if (statusRes?.status) setSubStatus(String(statusRes.status).toLowerCase());
                if (statusRes?.plan) {
                    const normalized = String(statusRes.plan).toLowerCase();
                    const match = PLANS.find((p) => normalized.includes(p.id) || p.name.toLowerCase().includes(normalized));
                    if (match?.id) setCurrentPlan(match.id);
                }
                if (statusRes?.expiresAt) setExpiresAt(statusRes.expiresAt);
                setApiPlans(plansRes?.plans || []);
            } catch (err) {
                setError(err?.message || 'Failed to load subscription data. Showing defaults.');
            } finally {
                setLoading(false);
            }
        };

        loadSubscriptionData();
    }, []);

    // Load Razorpay SDK script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Handle upgrade button click - initiate Razorpay checkout
    const handleUpgrade = async (plan) => {
        try {
            setCheckoutLoading(true);
            setError('');

            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setError('Failed to load payment gateway. Please try again.');
                setCheckoutLoading(false);
                return;
            }

            // Create order on backend
            const orderResponse = await SubscriptionService.createOrder(plan.id, billing);
            if (!orderResponse?.orderId) {
                setError('Failed to create payment order. Please try again.');
                setCheckoutLoading(false);
                return;
            }

            const { orderId, amount, currency, keyId } = orderResponse;

            // Open Razorpay checkout modal
            const options = {
                key: keyId,
                amount: amount,
                currency: currency || 'INR',
                order_id: orderId,
                description: `Subscribe to ${plan.name} plan`,
                prefill: {
                    name: 'User',
                    email: 'user@example.com',
                    contact: '',
                },
                handler: async (response) => {
                    try {
                        // Verify payment on backend
                        const verifyResponse = await SubscriptionService.verifyPayment(
                            orderId,
                            response.razorpay_payment_id,
                            response.razorpay_signature
                        );

                        if (verifyResponse?.success) {
                            setSubStatus('active');
                            setCurrentPlan(plan.id);
                            setError('');
                            // Reload subscription data
                            const [statusRes, plansRes] = await Promise.all([
                                SubscriptionService.getStatus(),
                                SubscriptionService.getPlans(),
                            ]);
                            if (statusRes?.status) setSubStatus(String(statusRes.status).toLowerCase());
                            if (statusRes?.plan) {
                                const normalized = String(statusRes.plan).toLowerCase();
                                const match = PLANS.find((p) => normalized.includes(p.id) || p.name.toLowerCase().includes(normalized));
                                if (match?.id) setCurrentPlan(match.id);
                            }
                            if (statusRes?.expiresAt) setExpiresAt(statusRes.expiresAt);
                            setApiPlans(plansRes?.plans || []);
                        } else {
                            setError('Payment verification failed. Please contact support.');
                        }
                    } catch (err) {
                        setError(err?.message || 'Payment verification failed. Please try again.');
                    } finally {
                        setCheckoutLoading(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setCheckoutLoading(false);
                    },
                },
                theme: {
                    color: '#7c3aed',
                },
            };

            // Open checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            setError(err?.message || 'Failed to initiate payment. Please try again.');
            setCheckoutLoading(false);
        }
    };

    // Reload subscription data function
    const loadSubscriptionData = async () => {
        setLoading(true);
        setError('');
        try {
            const [statusRes, plansRes] = await Promise.all([
                SubscriptionService.getStatus(),
                SubscriptionService.getPlans(),
            ]);

            if (statusRes?.status) setSubStatus(String(statusRes.status).toLowerCase());
            if (statusRes?.plan) {
                const normalized = String(statusRes.plan).toLowerCase();
                const match = PLANS.find((p) => normalized.includes(p.id) || p.name.toLowerCase().includes(normalized));
                if (match?.id) setCurrentPlan(match.id);
            }
            if (statusRes?.expiresAt) setExpiresAt(statusRes.expiresAt);
            setApiPlans(plansRes?.plans || []);
        } catch (err) {
            setError(err?.message || 'Failed to load subscription data. Showing defaults.');
        } finally {
            setLoading(false);
        }
    };

    const dynamicPlans = useMemo(() => {
        if (!apiPlans.length) return PLANS;

        const byName = {
            free: PLANS[0],
            pro: PLANS[1],
            team: PLANS[2],
        };

        const grouped = {};
        for (const p of apiPlans) {
            const base = String(p.id || '').split('_')[0];
            if (!grouped[base]) grouped[base] = { ...byName[base] };
            if (!grouped[base]) continue;
            const amountInr = Number(p.price || 0) / 100;
            if (p.billingPeriod === 'yearly') grouped[base].yearly = amountInr;
            else grouped[base].monthly = amountInr;
            grouped[base].name = p.name?.includes('(') ? grouped[base].name : (p.name || grouped[base].name);
        }

        return Object.values(grouped).length ? Object.values(grouped) : PLANS;
    }, [apiPlans]);

    const t1     = dark ? 'text-white'     : 'text-slate-900';
    const t2     = dark ? 'text-slate-400' : 'text-slate-500';
    const t3     = dark ? 'text-slate-300' : 'text-slate-600';
    const bg     = dark ? 'bg-[#0f1829]'   : 'bg-white';
    const bg2    = dark ? 'bg-[#131e30]'   : 'bg-slate-50';
    const border = dark ? 'border-slate-700/60' : 'border-slate-200';
    const card   = cn('border rounded-2xl p-6 transition-all', bg, border);
    const inputCls = cn(
        'w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30',
        dark
            ? 'bg-[#1a2640] border-slate-700/60 text-white placeholder-slate-500'
            : 'bg-white border-slate-200 text-slate-900'
    );

    const planColorMap = {
        blue:   { ring: 'ring-blue-500',   badge: 'bg-blue-500',   btn: 'bg-blue-600 hover:bg-blue-700',     curr: dark ? 'bg-blue-900/20 border-blue-500/40'     : 'bg-blue-50 border-blue-400'   },
        violet: { ring: 'ring-violet-500', badge: 'bg-violet-500', btn: 'bg-violet-600 hover:bg-violet-700', curr: dark ? 'bg-violet-900/20 border-violet-500/40'  : 'bg-violet-50 border-violet-400' },
        amber:  { ring: 'ring-amber-500',  badge: 'bg-amber-500',  btn: 'bg-amber-500 hover:bg-amber-600',   curr: dark ? 'bg-amber-900/20 border-amber-500/40'    : 'bg-amber-50 border-amber-400'  },
    };

    const featureVal = (val) => {
        if (val === true)  return <Check />;
        if (val === false) return <Cross />;
        return <span className={cn('text-xs font-semibold', t3)}>{val}</span>;
    };

    const planAction = (plan) => {
        if (plan.id === currentPlan) return null;
        const currentIdx = dynamicPlans.findIndex(p => p.id === currentPlan);
        const targetIdx  = dynamicPlans.findIndex(p => p.id === plan.id);
        return targetIdx > currentIdx ? 'Upgrade' : 'Downgrade';
    };

    const price = (plan) => billing === 'yearly' ? plan.yearly : plan.monthly;

    return (
        <div className="space-y-8">

            {error && (
                <div className={cn('rounded-xl border px-4 py-3 text-sm', dark ? 'border-rose-500/40 bg-rose-500/10 text-rose-200' : 'border-rose-300 bg-rose-50 text-rose-700')}>
                    {error}
                </div>
            )}

            {/* ── Page header ──────────────────────────────────────── */}
            <div className={cn('rounded-2xl border p-6', dark ? 'bg-[#0f1829] border-slate-700/60' : 'bg-gradient-to-r from-violet-50 to-slate-50 border-slate-200')}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className={cn('text-2xl font-bold', t1)}>Subscription & Billing</h2>
                        <p className={cn('text-sm mt-1', t2)}>Manage your plan, billing cycle, and payment details.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={subStatus} />
                        {subStatus === 'trial' && (
                            <span className={cn('text-xs', t2)}>Trial ends in <strong className="text-amber-500">7 days</strong></span>
                        )}
                        {subStatus === 'failed' && (
                            <button className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-all">
                                Fix Payment
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Current plan status card ─────────────────────────── */}
            <div className={card}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                    <h3 className={cn('font-bold text-lg', t1)}>Current Plan</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                            {dynamicPlans.find((p) => p.id === currentPlan)?.name || 'Current Plan'}
                        </span>
                        <StatusBadge status={subStatus} />
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Plan Amount',    val: `$${(price(dynamicPlans.find((p) => p.id === currentPlan) || dynamicPlans[0]) || 0).toFixed(2)} / mo`,     icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                        { label: 'Billing Cycle',  val: billing === 'yearly' ? 'Yearly' : 'Monthly',         icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                        { label: 'Next Billing',   val: expiresAt ? new Date(expiresAt).toLocaleDateString() : 'N/A',     icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'Payment Method', val: 'Visa ···· 4242',  icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                    ].map(({ label, val, icon }) => (
                        <div key={label} className={cn('rounded-xl p-4 border', bg2, border)}>
                            <div className="flex items-center gap-2 mb-2">
                                <svg className={cn('w-4 h-4', dark ? 'text-violet-400' : 'text-violet-600')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                                </svg>
                                <span className={cn('text-xs font-medium', t2)}>{label}</span>
                            </div>
                            <p className={cn('text-sm font-bold', t1)}>{val}</p>
                        </div>
                    ))}
                </div>
                <div className={cn('mt-4 pt-4 border-t flex flex-wrap gap-2', border)}>
                    <button className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 hover:shadow-lg hover:shadow-violet-500/20 hover:-translate-y-0.5 transition-all">
                        Update Payment Method
                    </button>
                    <button
                        onClick={() => setShowInvoices(v => !v)}
                        className={cn('px-4 py-2 text-sm font-semibold rounded-xl border transition-all hover:-translate-y-0.5', dark ? 'border-slate-700 text-slate-300 hover:border-violet-500/50' : 'border-slate-200 text-slate-700 hover:border-violet-300')}
                    >
                        {showInvoices ? 'Hide' : 'View'} Invoices
                    </button>
                    <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={cancelLoading || loading}
                        className="px-4 py-2 text-sm font-semibold text-red-500 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-all"
                    >
                        {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                </div>
            </div>

            {/* ── Invoice history (collapsible) ────────────────────── */}
            {showInvoices && (
                <div className={card}>
                    <h3 className={cn('font-bold text-lg mb-4', t1)}>Billing History</h3>
                    <div className="overflow-x-auto -mx-2">
                        <table className="w-full min-w-[480px] text-sm">
                            <thead>
                                <tr className={cn('border-b', border)}>
                                    {['Invoice', 'Date', 'Plan', 'Amount', 'Status', ''].map(h => (
                                        <th key={h} className={cn('text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide', t2)}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {INVOICES.map(inv => (
                                    <tr key={inv.id} className={cn('border-b last:border-0 hover:bg-violet-500/5 transition-colors', border)}>
                                        <td className={cn('px-3 py-3 font-mono text-xs font-semibold', dark ? 'text-violet-400' : 'text-violet-600')}>{inv.id}</td>
                                        <td className={cn('px-3 py-3', t3)}>{inv.date}</td>
                                        <td className={cn('px-3 py-3', t3)}>{inv.plan}</td>
                                        <td className={cn('px-3 py-3 font-semibold', t1)}>{inv.amount}</td>
                                        <td className="px-3 py-3">
                                            <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">{inv.status}</span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <button className={cn('text-xs font-semibold hover:underline', dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}>Download</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Billing cycle toggle ─────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className={cn('text-xl font-bold', t1)}>Available Plans</h3>
                    <p className={cn('text-sm mt-0.5', t2)}>Upgrade, downgrade or switch billing cycle anytime.</p>
                </div>
                <div className={cn('inline-flex items-center rounded-xl border p-1 gap-1', dark ? 'bg-[#131e30] border-slate-700/60' : 'bg-slate-100 border-slate-200')}>
                    {['monthly', 'yearly'].map(cycle => (
                        <button
                            key={cycle}
                            onClick={() => setBilling(cycle)}
                            className={cn(
                                'px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all',
                                billing === cycle
                                    ? 'bg-violet-600 text-white shadow-md'
                                    : cn(t2, 'hover:opacity-80')
                            )}
                        >
                            {cycle}
                            {cycle === 'yearly' && <span className="ml-1.5 text-xs text-green-400 font-bold">-25%</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Plan cards ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {dynamicPlans.map(plan => {
                    const isCurrent = plan.id === currentPlan;
                    const colors    = planColorMap[plan.color];
                    const action    = planAction(plan);
                    const pr        = price(plan);

                    return (
                        <div
                            key={plan.id}
                            className={cn(
                                'relative rounded-2xl border-2 p-6 flex flex-col transition-all duration-300',
                                isCurrent
                                    ? cn(colors.curr, 'shadow-xl')
                                    : cn(dark ? 'bg-[#0f1829] border-slate-700/60 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300', 'hover:shadow-lg'),
                                plan.id === 'pro' ? 'md:scale-[1.03] md:z-10' : ''
                            )}
                        >
                            {plan.badge && (
                                <div className={cn('absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg', colors.badge)}>
                                    {plan.badge}
                                </div>
                            )}
                            {isCurrent && (
                                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-emerald-500">
                                    ✓ Current
                                </div>
                            )}

                            <h3 className={cn('text-xl font-black', t1)}>{plan.name}</h3>
                            <p className={cn('text-sm mt-1 mb-5', t2)}>{plan.desc}</p>

                            <div className="flex items-end gap-1 mb-6">
                                <span className={cn('text-5xl font-black', t1)}>{pr === 0 ? 'Free' : `$${pr}`}</span>
                                {pr > 0 && <span className={cn('text-sm mb-2', t2)}>/{billing === 'yearly' ? 'mo billed yearly' : 'mo'}</span>}
                            </div>
                            {billing === 'yearly' && pr > 0 && (
                                <p className="text-xs text-green-500 font-semibold -mt-4 mb-4">
                                    Save ${(plan.monthly - plan.yearly) * 12}/year
                                </p>
                            )}

                            <ul className="space-y-2.5 flex-1 mb-6">
                                {FEATURE_KEYS.map(key => {
                                    const val = plan.features[key];
                                    return (
                                        <li key={key} className="flex items-center gap-2.5 text-sm">
                                            {featureVal(val)}
                                            <span className={val === false ? cn('line-through', t2) : t3}>{key}</span>
                                            {typeof val === 'string' && (
                                                <span className={cn('ml-auto text-xs font-semibold', dark ? 'text-violet-400' : 'text-violet-600')}>{val}</span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                            {isCurrent ? (
                                <button disabled className={cn('w-full py-2.5 rounded-xl text-sm font-bold text-white cursor-not-allowed opacity-60', colors.btn)}>
                                    Current Plan
                                </button>
                            ) : action ? (
                                <button 
                                    onClick={() => handleUpgrade(plan)}
                                    disabled={checkoutLoading || loading}
                                    className={cn('w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all', 
                                        checkoutLoading || loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg',
                                        colors.btn
                                    )}
                                >
                                    {checkoutLoading ? 'Processing...' : `${action} to ${plan.name}`}
                                </button>
                            ) : (
                                <button className={cn('w-full py-2.5 rounded-xl text-sm font-bold border transition-all', dark ? 'border-slate-700 text-slate-300 hover:border-violet-500' : 'border-slate-300 text-slate-700 hover:border-violet-400')}>
                                    Contact Sales
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Feature comparison table ─────────────────────────── */}
            <div className={card}>
                <h3 className={cn('font-bold text-lg mb-5', t1)}>Full Feature Comparison</h3>
                <div className="overflow-x-auto -mx-2">
                    <table className="w-full min-w-[560px] text-sm">
                        <thead>
                            <tr className={cn('border-b', border)}>
                                <th className={cn('text-left px-4 py-3 font-semibold', t2)}>Feature</th>
                                {dynamicPlans.map(p => (
                                    <th key={p.id} className={cn('text-center px-4 py-3 font-bold',
                                        p.id === currentPlan ? (dark ? 'text-violet-400' : 'text-violet-700') : t1)}>
                                        {p.name}
                                        {p.id === currentPlan && <span className="ml-1 text-xs text-emerald-500">(current)</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {FEATURE_KEYS.map((key, i) => (
                                <tr key={key} className={cn('border-b last:border-0 hover:bg-violet-500/5 transition-colors', border, i % 2 === 0 ? (dark ? 'bg-white/[0.01]' : 'bg-slate-50/50') : '')}>
                                    <td className={cn('px-4 py-3 font-medium', t3)}>{key}</td>
                                    {dynamicPlans.map(p => (
                                        <td key={p.id} className="px-4 py-3 text-center">
                                            <div className="flex justify-center">
                                                {featureVal(p.features[key])}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Payment method card ──────────────────────────────── */}
            <div className={card}>
                <h3 className={cn('font-bold text-lg mb-5', t1)}>Payment Method</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                    <div className={cn('flex items-center gap-4 p-4 rounded-xl border', dark ? 'bg-[#1a2640] border-slate-700/60' : 'bg-slate-50 border-slate-200')}>
                        <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">VISA</span>
                        </div>
                        <div>
                            <p className={cn('text-sm font-semibold', t1)}>•••• •••• •••• 4242</p>
                            <p className={cn('text-xs', t2)}>Expires 08/2028</p>
                        </div>
                        <span className="ml-3 text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Default</span>
                    </div>
                    <button className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-violet-600 hover:bg-violet-700 transition-all">
                        Add New Card
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { label: 'Card Number',      placeholder: '•••• •••• •••• ••••' },
                        { label: 'Cardholder Name',  placeholder: 'John Doe' },
                        { label: 'Expiry Date',      placeholder: 'MM / YY' },
                        { label: 'CVC',              placeholder: '•••' },
                    ].map(({ label, placeholder }) => (
                        <div key={label}>
                            <label className={cn('block text-xs font-semibold mb-1.5', t2)}>{label}</label>
                            <input className={inputCls} placeholder={placeholder} />
                        </div>
                    ))}
                </div>
                <button className="mt-5 px-6 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 hover:shadow-lg hover:shadow-violet-500/20 hover:-translate-y-0.5 transition-all">
                    Save Card
                </button>
            </div>

            {/* ── Cancel Subscription modal ────────────────────────── */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={cn('w-full max-w-md rounded-2xl border p-6 shadow-2xl', bg, border)}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className={cn('text-lg font-bold', t1)}>Cancel Subscription?</h3>
                        </div>
                        <p className={cn('text-sm mb-5', t2)}>
                            Your Premium King plan will remain active until <strong className={t1}>Apr 1, 2026</strong>.
                            After that, you'll be moved to the Starter (free) plan. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all', dark ? 'border-slate-700 text-slate-300 hover:border-slate-500' : 'border-slate-200 text-slate-700 hover:border-slate-300')}
                            >
                                Keep Plan
                            </button>
                            <button
                                disabled={cancelLoading}
                                onClick={async () => {
                                    try {
                                        setCancelLoading(true);
                                        await SubscriptionService.cancel();
                                        setSubStatus('cancelled');
                                        setShowCancelModal(false);
                                    } catch (err) {
                                        setError(err?.message || 'Failed to cancel subscription.');
                                    } finally {
                                        setCancelLoading(false);
                                    }
                                }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all"
                            >
                                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edge-case callout banners ────────────────────────── */}
            {subStatus === 'expired' && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                        <p className="font-bold text-red-400 mb-1">Your subscription has expired</p>
                        <p className="text-sm text-red-400/80">Renew now to restore access to premium templates and features.</p>
                    </div>
                    <button className="shrink-0 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all">
                        Renew Now
                    </button>
                </div>
            )}
            {subStatus === 'failed' && (
                <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                        <p className="font-bold text-orange-400 mb-1">Payment failed</p>
                        <p className="text-sm text-orange-400/80">Your last payment on Mar 1, 2026 was declined. Update your payment method to avoid service interruption.</p>
                    </div>
                    <button className="shrink-0 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition-all">
                        Retry Payment
                    </button>
                </div>
            )}
        </div>
    );
};

export default Subscription;
