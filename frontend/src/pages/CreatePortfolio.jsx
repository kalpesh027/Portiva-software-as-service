import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { CiCloudRainbow } from 'react-icons/ci';
import { useStoredTheme } from '../hooks/useStoredTheme';
import { cn } from '../utils/cn';
import { PORTFOLIO_STEPS } from '../constants/steps';
import { loadDraftThunk, saveDraftThunk } from '../features/portfolio/portfolioSlice';
import PersonalInfo from '../components/form/PersonalInfo';
import SkillsForm from '../components/form/SkillsForm';
import ExperienceForm from '../components/form/ExperienceForm';
import ProjectForm from '../components/form/ProjectForm';
import EducationForm from '../components/form/EducationForm';
import TestimonialsForm from '../components/form/TestimonialsForm';
import ContactForm from '../components/form/ContactForm';

/*
 * USER FLOW:
 * 1. New user registers → Redirect to /create (this stepper)
 * 2. User fills stepper data → Save progress to backend on each step (via saveDraftThunk in each form)
 * 3. User completes all 7 steps → Mark portfolio 'completed' → Redirect to /dashboard
 * 4. User logs out mid-stepper → currentStep saved in backend
 * 5. User logs in again:
 *    - If portfolio NOT completed → /create (resume from saved step)
 *    - If portfolio completed     → /dashboard
 */

const STEPS = PORTFOLIO_STEPS;

const CreatePortfolio = () => {
  const dispatch = useDispatch();
  const dark = useStoredTheme();
  const { currentStep, isSavingDraft, isLoadingDraft, formData } = useSelector((state) => state.portfolio);

  // On mount: load existing draft from backend to resume where user left off
  useEffect(() => {
    dispatch(loadDraftThunk());
  }, [dispatch]);

  // Auto-save on every step change (fires after the step has already advanced in Redux)
  useEffect(() => {
    if (currentStep > 1) {
      dispatch(saveDraftThunk({ formData, currentStep }));
    }
    // We intentionally only depend on currentStep so this fires once per step advance,
    // not on every keystroke. formData is captured at save time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <PersonalInfo />;
      case 2: return <SkillsForm />;
      case 3: return <ExperienceForm />;
      case 4: return <ProjectForm />;
      case 5: return <EducationForm />;
      case 6: return <TestimonialsForm />;
      case 7: return <ContactForm />;
      default: return <PersonalInfo />;
    }
  };

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className={cn('min-h-screen', dark ? 'bg-[#080e1a]' : 'bg-slate-50')}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── Top nav bar ── */}
      <header className={cn(
        'sticky top-0 z-30 border-b backdrop-blur-md',
        dark ? 'bg-[#080e1a]/90 border-slate-800/50' : 'bg-white/90 border-slate-100'
      )}>
        <div className='max-w-7xl mx-auto px-6 h-14 flex items-center justify-between'>
          <Link to='/' className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center'>
              <CiCloudRainbow size={18} className='text-white' />
            </div>
            <span className={cn('font-black text-base tracking-tight', dark ? 'text-white' : 'text-slate-900')}>Portiva</span>
          </Link>

          {/* Mini progress bar + saving indicator */}
          <div className='flex items-center gap-3'>
            {isSavingDraft && (
              <span className={cn('text-xs', dark ? 'text-slate-400' : 'text-slate-500')}>
                Saving…
              </span>
            )}
            <span className={cn('text-xs font-medium', dark ? 'text-slate-400' : 'text-slate-500')}>
              Step {currentStep} of {STEPS.length}
            </span>
            <div className={cn('w-28 h-1.5 rounded-full overflow-hidden', dark ? 'bg-slate-700' : 'bg-slate-200')}>
              <div
                className='h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500 rounded-full'
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-8'>
        <div className='flex gap-6 lg:gap-8 items-stretch h-full'>

          {/* Left Sidebar */}
          <aside className={cn(
            'hidden md:flex w-56 lg:w-60 flex-shrink-0 flex-col rounded-2xl border p-5 h-full overflow-hidden',
            dark ? 'bg-[#0d1525] border-slate-700/50' : 'bg-white border-slate-200',
            'sticky top-0'
          )}>
            <p className={cn('text-xs font-bold uppercase tracking-widest mb-5', dark ? 'text-slate-500' : 'text-slate-400')}>
              Your Progress
            </p>

            <div className='flex flex-col gap-1'>
              {STEPS.map((step, index) => {
                const completed = currentStep > step.id;
                const active    = currentStep === step.id;
                return (
                  <div key={step.id} className='relative'>
                    {/* Connector line */}
                    {index < STEPS.length - 1 && (
                      <div className={cn(
                        'absolute left-8 top-[56px] w-0.5 h-9',
                        completed ? 'bg-violet-500' : dark ? 'bg-slate-700' : 'bg-slate-200'
                      )} />
                    )}

                    <div className={cn(
                      'flex items-center gap-3 px-3 py-4 rounded-xl transition-all',
                      active    ? dark ? 'bg-violet-500/15' : 'bg-violet-50' : '',
                      !active && !completed ? '' : ''
                    )}>
                      {/* Icon circle */}
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                        completed
                          ? 'bg-gradient-to-br from-violet-600 to-violet-400 text-white shadow-sm shadow-violet-500/30'
                          : active
                            ? dark ? 'bg-violet-500/25 text-violet-400' : 'bg-violet-100 text-violet-600'
                            : dark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                      )}>
                        {completed ? (
                          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M5 13l4 4L19 7' />
                          </svg>
                        ) : (
                          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d={step.iconPath} />
                          </svg>
                        )}
                      </div>

                      {/* Text */}
                      <div className='min-w-0'>
                        <p className={cn(
                          'text-sm font-bold leading-tight truncate',
                          active    ? dark ? 'text-violet-300' : 'text-violet-700'
                          : completed ? dark ? 'text-slate-300' : 'text-slate-700'
                          : dark    ? 'text-slate-500' : 'text-slate-400'
                        )}>
                          {step.title}
                        </p>
                        <p className={cn(
                          'text-[13px] truncate mt-0.5',
                          dark ? 'text-slate-600' : 'text-slate-400'
                        )}>
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right: Form area */}
          <main className='flex-1 min-w-0'>
            {isLoadingDraft ? (
              <div className={cn(
                'rounded-2xl border p-8 flex items-center justify-center',
                dark ? 'bg-[#0d1525] border-slate-700/50' : 'bg-white border-slate-200'
              )}>
                <span className={cn('text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>
                  Resuming your progress…
                </span>
              </div>
            ) : (
              <div className={cn(
                  'rounded-2xl border p-6 sm:p-8',
                dark ? 'bg-[#0d1525] border-slate-700/50' : 'bg-white border-slate-200'
              )}>
                {/* Step header */}
                <div className='mb-7'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className={cn(
                      'text-xs font-bold uppercase tracking-widest',
                      dark ? 'text-violet-400' : 'text-violet-600'
                    )}>
                      Step {currentStep} / {STEPS.length}
                    </span>
                  </div>
                  <h2 className={cn('text-2xl font-black tracking-tight', dark ? 'text-white' : 'text-slate-900')}>
                    {STEPS[currentStep - 1]?.title}
                  </h2>
                  <p className={cn('text-sm mt-1', dark ? 'text-slate-400' : 'text-slate-500')}>
                    {STEPS[currentStep - 1]?.subtitle}
                  </p>
                  <div className={cn('mt-4 h-px', dark ? 'bg-slate-700/50' : 'bg-slate-100')} />
                </div>

                {/* Injected form component */}
                {renderStep()}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CreatePortfolio;
