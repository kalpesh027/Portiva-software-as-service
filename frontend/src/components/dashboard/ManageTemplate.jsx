import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '../landing/landingUtils';
import PortfolioService from '../../services/portfolioService';
import apiClient from '../../services/apiClient';
import { getTemplatePreviewImage } from '../../config/templatePreviewImages';
import { getTemplateDisplayName } from '../../config/templateDisplayNames';
import { TEMPLATE_IDS } from '../../templates';
import {
    selectTemplateSwitchState,
    switchInitiated,
    switchPolling,
    switchComplete,
    switchFailed,
} from '../../features/portfolio/portfolioSlice';

const ManageTemplate = ({ dark = false, portfolio = null, onRefresh }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('developer_minimal');
    const [activeTemplate, setActiveTemplate] = useState('developer_minimal');
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusNotice, setStatusNotice] = useState({ type: '', message: '' });
    const {
        templateSwitching,
        templateSwitchTarget,
        templateSwitchMessage,
    } = useSelector(selectTemplateSwitchState);

    const textPrimary = dark ? 'text-white'        : 'text-gray-900';
    const textSecond  = dark ? 'text-slate-300'    : 'text-gray-600';
    const sectionBg   = dark ? 'bg-[#0f1829] border-slate-700/60' : 'bg-gray-50/50 border-gray-200/60';
    const innerCard   = dark ? 'bg-[#131e30] border-slate-700/60' : 'bg-white border-gray-200';
    const featurePill = dark ? 'bg-slate-700/60 text-slate-300'   : 'bg-gray-100 text-gray-700';
    const featurePillSm = dark ? 'bg-slate-700/60 text-slate-400' : 'bg-gray-100 text-gray-600';

    const fallbackPreviewImage = '/template-images/developer-minimal.png';

    // Fetch templates from backend
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setTemplatesLoading(true);
                setError(null);
                const data = await apiClient.get('/templates');
                const normalizedTemplates = (Array.isArray(data) ? data : [])
                    .filter((template) => TEMPLATE_IDS.includes(template.id))
                    .map((template) => ({
                    ...template,
                    name: getTemplateDisplayName(template.id, template.name || template.id),
                    previewImage: getTemplatePreviewImage(template.id, template.previewImage)
                }));
                setTemplates(normalizedTemplates);
                
                if (data.length > 0) {
                    setSelectedTemplate((prev) => prev || data[0].id);
                    setActiveTemplate((prev) => prev || data[0].id);
                }
            } catch (err) {
                console.error('Failed to load templates:', err);
                setError(err?.message || 'Failed to load templates');
                
                // Fallback to default templates if API fails
                const fallbackTemplates = [
                    {
                        id: 'developer_minimal',
                        name: 'Developer Minimal',
                        color: '#8B5CF6',
                        description: 'Clean, single-page developer layout with minimal UI and fast loading',
                        features: ['Minimal UI', 'Fast Loading', 'Mobile First'],
                        previewImage: '/template-images/developer-minimal.png'
                    },
                    {
                        id: 'developer_modern',
                        name: 'Modern Developer',
                        color: '#6366F1',
                        description: 'Dark theme with code aesthetic and bold typography',
                        features: ['Bold Typography', 'Project Focus', 'Code Sections'],
                        previewImage: '/template-images/developer-modern.png'
                    },
                    {
                        id: 'developer_resume_multi',
                        name: 'Developer Resume (Multi)',
                        color: '#10B981',
                        description: 'Multi-page resume layout with career timeline and achievements',
                        features: ['Multi Page', 'Resume Style', 'Career Timeline'],
                        previewImage: getTemplatePreviewImage('developer_resume_multi', '/template-images/developer-resume-multi.png')
                    },
                    {
                        id: 'designer_visual',
                        name: 'Visual Designer',
                        color: '#EC4899',
                        description: 'Visual-first grid layout with image gallery and portfolio showcase',
                        features: ['Image Gallery', 'Visual Focus', 'Portfolio Grid'],
                        previewImage: '/template-images/designer-visual.png'
                    },
                    {
                        id: 'freelancer_cards',
                        name: 'Freelancer Cards',
                        color: '#F59E0B',
                        description: 'Service cards layout with testimonials and client focus',
                        features: ['Service Cards', 'Client Focus', 'Testimonials'],
                        previewImage: '/template-images/freelancer-cards.png'
                    },
                    {
                        id: 'developer_spline_showcase',
                        name: 'Developer Spline Showcase',
                        color: '#7C3AED',
                        description: 'Gradient-rich showcase template with animated cards and project highlights',
                        features: ['Showcase Layout', 'Animated Cards', 'Strong Hero Section'],
                        previewImage: '/template-images/developer-spline-showcase.svg'
                    }
                ];
                setTemplates(fallbackTemplates);
                setSelectedTemplate((prev) => prev || fallbackTemplates[0].id);
                setActiveTemplate((prev) => prev || fallbackTemplates[0].id);
            } finally {
                setTemplatesLoading(false);
            }
        };
        
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (portfolio?.templateName) {
            if (portfolio?.status === 'published') {
                setActiveTemplate(portfolio.templateName);
            }
            if (!isLoading) {
                setSelectedTemplate(portfolio.templateName);
            }
        }
    }, [portfolio?.templateName, portfolio?.status, isLoading]);

    const resolveTemplateId = (value) => {
        if (!value) return value;
        const direct = templates.find((t) => t.id === value);
        if (direct) return direct.id;

        const byName = templates.find((t) =>
            String(t.name || '').toLowerCase() === String(value).toLowerCase()
        );
        return byName?.id || value;
    };

    const selectedTemplateMeta = templates.find((t) => t.id === selectedTemplate) || templates[0];
    const activeTemplateMeta = templates.find((t) => t.id === activeTemplate)
        || selectedTemplateMeta
        || templates[0];

    const isRecoverableSwitchError = (err) => {
        const status = err?.response?.status;
        const message = String(err?.response?.data?.message || err?.message || '').toLowerCase();
        return status >= 500 || message.includes('unexpected error occurred');
    };

    const pollTemplateSwitchCompletion = async (targetTemplateId, timeoutMs = 180000) => {
        const startedAt = Date.now();
        const waitMs = 4000;

        while (Date.now() - startedAt < timeoutMs) {
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            dispatch(switchPolling({ message: 'Switching template... AI is generating your portfolio' }));

            try {
                const latest = await PortfolioService.getMyPortfolio();
                console.debug('Template switch poll response:', latest);
                const latestPortfolio = latest?.portfolio || latest;

                if (latestPortfolio?.templateName) {
                    setActiveTemplate(latestPortfolio.templateName);
                }

                if (latestPortfolio?.status === 'failed' || latestPortfolio?.aiStatus === 'failed') {
                    return { completed: false, failed: true, message: 'Template generation failed. Please retry.' };
                }

                if (
                    latestPortfolio?.templateName === targetTemplateId
                    && (latestPortfolio?.status === 'published' || latestPortfolio?.aiStatus === 'done')
                ) {
                    return { completed: true };
                }

                if (latestPortfolio?.status === 'published' || latestPortfolio?.aiStatus === 'done') {
                    // Backend finished AI processing; consider switch flow complete to avoid stuck loader.
                    return { completed: true, actualTemplate: latestPortfolio?.templateName || null };
                }
            } catch (pollError) {
                // Keep polling when a transient backend error happens after switch was accepted.
                console.warn('Template switch polling error:', pollError?.message || pollError);
            }
        }

        return { completed: false, failed: false };
    };

    const handleChangeTemplate = async () => {
        if (!portfolio?.id) {
            setStatusNotice({ type: 'error', message: 'Please generate a portfolio first.' });
            return;
        }
        const normalizedTemplateId = resolveTemplateId(selectedTemplate);
        if (normalizedTemplateId === activeTemplate) {
            setStatusNotice({ type: 'info', message: 'This template is already active.' });
            return;
        }

        setStatusNotice({ type: 'info', message: 'Switching template... AI is generating your portfolio' });
        setIsLoading(true);
        try {
            let jobId = null;

            try {
                const response = await PortfolioService.changeTemplate(portfolio.id, { templateName: normalizedTemplateId });
                console.debug('Template switch response:', response);
                const portfolioPayload = response?.portfolio || response;
                jobId = portfolioPayload?.jobId || portfolioPayload?.job_id || portfolioPayload?.switchJobId || null;
            } catch (kickoffError) {
                if (!isRecoverableSwitchError(kickoffError)) {
                    throw kickoffError;
                }
                console.warn('Template switch kickoff had recoverable error, continuing to poll:', kickoffError?.message || kickoffError);
            }

            dispatch(switchInitiated({
                jobId,
                targetTemplate: normalizedTemplateId,
                message: 'Switching template... AI is generating your portfolio',
            }));

            const pollResult = await pollTemplateSwitchCompletion(normalizedTemplateId);
            if (pollResult.completed) {
                const finalTemplate = pollResult.actualTemplate || normalizedTemplateId;
                setSelectedTemplate(finalTemplate);
                setActiveTemplate(finalTemplate);
                if (onRefresh) await onRefresh();
                dispatch(switchComplete({ message: 'Template switched successfully' }));
                setStatusNotice({ type: 'success', message: 'Template switched successfully' });
                return;
            }

            if (pollResult.failed) {
                dispatch(switchFailed({ message: pollResult.message }));
                setStatusNotice({ type: 'error', message: pollResult.message });
                return;
            }

            if (onRefresh) await onRefresh();
            dispatch(switchFailed({ message: "This is taking longer than expected. You'll be notified when ready." }));
            setStatusNotice({ type: 'info', message: "This is taking longer than expected. You'll be notified when ready." });
        } catch (err) {
            const backendMessage = err?.response?.data?.message;
            const networkMessage = !navigator.onLine || !err?.response?.status ? 'Connection failed, please try again' : null;
            const finalMessage = backendMessage || networkMessage || err?.message || 'Connection failed, please try again';
            dispatch(switchFailed({ message: finalMessage }));
            setStatusNotice({ type: 'error', message: finalMessage });
        } finally {
            setIsLoading(false);
        }
    };

    if (templatesLoading) {
        return (
            <div className={cn('p-6 rounded-2xl border', sectionBg)}>
                <div className={cn('text-center', textPrimary)}>Loading templates...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={cn('p-6 rounded-2xl border', sectionBg)}>
                <h2 className={cn('text-2xl font-bold mb-2', textPrimary)}>Manage Template</h2>
                <p className={cn(textSecond)}>
                    View your current template and switch to a different design. AI will adapt your content to the new template.
                </p>
            </div>

            {/* Error message if any */}
            {error && (
                <div className={cn('p-4 rounded-2xl border-2', 'bg-red-50/50 border-red-200/60')}>
                    <p className="text-sm text-red-800">⚠️ {error}</p>
                </div>
            )}

            {(statusNotice.message || templateSwitching) && (
                <div className={cn(
                    'p-4 rounded-2xl border text-sm flex items-center gap-2',
                    statusNotice.type === 'success' && 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    statusNotice.type === 'error' && 'bg-rose-50 border-rose-200 text-rose-700',
                    (statusNotice.type === 'info' || templateSwitching) && (dark ? 'bg-violet-900/20 border-violet-700/40 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-700')
                )}>
                    {templateSwitching && (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                    )}
                    {templateSwitching ? (templateSwitchMessage || 'Switching template... AI is generating your portfolio') : statusNotice.message}
                </div>
            )}

            {/* Current Template Display */}
            {activeTemplateMeta && (
                <div className={cn('p-6 rounded-2xl border-2', dark ? 'bg-[#0f1829] border-violet-500/30' : 'bg-linear-to-br from-gray-50 to-gray-100 border-gray-900/20')}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className={cn('text-lg font-bold mb-1', textPrimary)}>Current Template</h3>
                            <p className={cn('text-sm', textSecond)}>Your active portfolio design</p>
                        </div>
                        <span className="backdrop-blur-sm bg-green-50/80 text-green-800 text-sm font-semibold px-3 py-1.5 rounded-lg border border-green-200/60 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Active
                        </span>
                    </div>
                    
                    <div className={cn('rounded-xl p-6 shadow-sm border', innerCard)}>
                        <div className="flex items-start gap-4 flex-col md:flex-row">
                            {/* Template Preview Image */}
                            {activeTemplateMeta.previewImage && (
                                <div className="w-full md:w-32 h-32 rounded-lg shadow-md overflow-hidden bg-gray-100 shrink-0">
                                    <img 
                                        src={activeTemplateMeta.previewImage} 
                                        alt={activeTemplateMeta.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            if (e.currentTarget.src !== window.location.origin + fallbackPreviewImage) {
                                                e.currentTarget.src = fallbackPreviewImage;
                                            }
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <h4 className={cn('text-xl font-bold mb-2', textPrimary)}>{activeTemplateMeta.name}</h4>
                                <p className={cn('mb-3', textSecond)}>
                                    {activeTemplateMeta.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {activeTemplateMeta.features && activeTemplateMeta.features.map((feature, idx) => (
                                        <span key={idx} className={cn('text-xs px-2 py-1 rounded-md', featurePill)}>
                                            ✓ {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Selection */}
            <div className={cn('p-6 rounded-2xl border', sectionBg)}>
                <h3 className={cn('text-lg font-bold mb-4', textPrimary)}>Choose New Template</h3>
                <p className={cn('text-sm mb-6', textSecond)}>Select a template below and click "Change Template" to switch</p>
                
                {templates.length === 0 ? (
                    <p className={cn('text-sm', textSecond)}>No templates available at the moment.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => !templateSwitching && setSelectedTemplate(template.id)}
                                className={cn(
                                    'cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg',
                                    dark ? 'bg-[#131e30]' : 'bg-white',
                                    templateSwitching && 'opacity-70 pointer-events-none',
                                    selectedTemplate === template.id
                                        ? (dark ? 'border-violet-500 shadow-md shadow-violet-500/10' : 'border-gray-900 shadow-md')
                                        : (dark ? 'border-slate-700/60 hover:border-violet-400/40' : 'border-gray-200/60 hover:border-gray-300')
                                )}
                            >
                                {/* Template Preview Image */}
                                {template.previewImage ? (
                                    <div className="aspect-video rounded-lg mb-3 overflow-hidden bg-gray-100 shadow-sm">
                                        <img 
                                            src={template.previewImage} 
                                            alt={template.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                if (e.currentTarget.src !== window.location.origin + fallbackPreviewImage) {
                                                    e.currentTarget.src = fallbackPreviewImage;
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div 
                                        className="aspect-video rounded-lg mb-3 relative overflow-hidden flex items-center justify-center text-white font-bold text-2xl"
                                        style={{ backgroundColor: template.color }}
                                    >
                                        {template.name.split(' ').map(w => w[0]).join('')}
                                    </div>
                                )}
                                <h4 className={cn('font-bold mb-1', textPrimary)}>{template.name}</h4>
                                <p className={cn('text-xs mb-3', textSecond)}>{template.description}</p>
                                <div className="flex flex-wrap gap-1">
                                    {template.features && template.features.map((feature, idx) => (
                                        <span key={idx} className={cn('text-xs px-2 py-0.5 rounded', featurePillSm)}>
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                                {activeTemplate === template.id && (
                                    <div className="mt-3 text-center">
                                        <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                            Current
                                        </span>
                                    </div>
                                )}
                                {selectedTemplate === template.id && (
                                    <div className="mt-3 text-center">
                                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
                                            ✓ Selected
                                        </span>
                                    </div>
                                )}
                                {templateSwitching && templateSwitchTarget === template.id && (
                                    <div className="mt-3 text-center">
                                        <span className="text-xs text-violet-700 font-semibold bg-violet-50 px-3 py-1 rounded-full border border-violet-200 inline-flex items-center gap-1">
                                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            Switching...
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="flex gap-4">
                <button
                    onClick={handleChangeTemplate}
                    disabled={isLoading || templateSwitching || !portfolio?.id}
                    className="flex-1 py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg bg-linear-to-r from-violet-600 to-violet-400 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5"
                >
                    {(isLoading || templateSwitching) ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Switching template... AI is generating your portfolio
                        </>
                    ) : (
                        <>
                            🎨 Change Template (AI Powered)
                        </>
                    )}
                </button>
            </div>

            {/* Info Box */}
            <div className={cn('border rounded-xl p-4', dark ? 'bg-violet-900/20 border-violet-700/40' : 'bg-purple-50/50 border-purple-200/60')}>
                <div className="flex items-start gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                        <h4 className={cn('font-semibold mb-1', dark ? 'text-violet-300' : 'text-purple-900')}>AI-Powered Template Switching</h4>
                        <ul className={cn('text-sm space-y-1', dark ? 'text-violet-400' : 'text-purple-800')}>
                            <li>• Select any template from the grid above</li>
                            <li>• Click "Change Template" button</li>
                            <li>• AI will automatically adapt your content to the new design</li>
                            <li>• Your data remains intact - only the design changes</li>
                            <li>• New template becomes active after AI processing completes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageTemplate;
