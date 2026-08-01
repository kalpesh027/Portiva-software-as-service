import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '../landing/landingUtils';
import PortfolioService from '../../services/portfolioService';
import {
  updateFormData,
  addSkill, removeSkill,
  addExperience, removeExperience,
  addProject, removeProject,
  addEducation, removeEducation,
  addTestimonial, removeTestimonial,
  updateContact
} from '../../features/portfolioSlice';
import { skillSuggestions, gradientColors } from '../../data/skillsData';

//icons
import { MdPerson } from 'react-icons/md';
import { MdOutlinePsychology } from 'react-icons/md';
import { BiBriefcase } from 'react-icons/bi';
import { MdOutlineAirplanemodeActive } from 'react-icons/md';
import { MdSchool } from 'react-icons/md';
import { BiMessageRoundedDots } from 'react-icons/bi';
import { MdEmail } from 'react-icons/md';

// Calendar helpers
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthNamesFull = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

const CalendarPicker = ({ calendarView, onDateSelect, onMonthChange, show, selectedDate, onYearChange, dark = false }) => {
  const [viewMode, setViewMode] = React.useState('date');
  const calendarRef = React.useRef(null);
  const daysInMonth = getDaysInMonth(calendarView.month, calendarView.year);
  const firstDay = getFirstDayOfMonth(calendarView.month, calendarView.year);
  const days = [];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const calBg    = dark ? 'bg-[#1a2640]/95 border-slate-700/60' : 'bg-white/90 border-gray-200/50';
  const calText1 = dark ? 'text-slate-100' : 'text-gray-900';
  const calText2 = dark ? 'text-slate-400' : 'text-gray-500';
  const calHover = dark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100';
  const calSel   = dark ? 'bg-violet-600/80 text-white' : 'bg-gray-200 text-gray-900';

  React.useEffect(() => { if (show) setViewMode('date'); }, [show]);

  const handleYearSelect = (year) => { onYearChange(year); setViewMode('month'); };
  const handleMonthSelect = (monthIndex) => { onMonthChange(monthIndex - calendarView.month); setViewMode('date'); };

  for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} className="h-8" />);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(calendarView.year, calendarView.month, day);
    const isSelected = selectedDate && new Date(selectedDate).toDateString() === date.toDateString();
    days.push(
      <button
        key={day}
        type="button"
        onClick={() => onDateSelect(date)}
        className={cn('h-8 rounded-lg text-sm font-medium transition-colors', isSelected ? calSel : cn(calHover, calText1))}
      >
        {day}
      </button>
    );
  }

  if (!show) return null;

  return (
    <div ref={calendarRef} className={cn('absolute z-20 mt-1 backdrop-blur-xl border rounded-2xl shadow-2xl p-4 w-72', calBg)}>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => { if (viewMode === 'date') onMonthChange(-1); else if (viewMode === 'month') onMonthChange(0, -1); }} className={cn('p-1 rounded-lg transition-colors', calHover)}>
          <svg className={cn('w-5 h-5', calText1)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          {viewMode === 'date' && <button type="button" onClick={() => setViewMode('year')} className={cn('font-semibold px-3 py-1 rounded-lg transition-colors', calText1, calHover)}>{monthNamesFull[calendarView.month]} {calendarView.year}</button>}
          {viewMode === 'month' && <button type="button" onClick={() => setViewMode('year')} className={cn('font-semibold px-3 py-1 rounded-lg transition-colors', calText1, calHover)}>{calendarView.year}</button>}
          {viewMode === 'year' && <div className={cn('font-semibold px-3 py-1', calText1)}>Select Year</div>}
        </div>
        <button type="button" onClick={() => { if (viewMode === 'date') onMonthChange(1); else if (viewMode === 'month') onMonthChange(0, 1); }} className={cn('p-1 rounded-lg transition-colors', calHover)}>
          <svg className={cn('w-5 h-5', calText1)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      {viewMode === 'date' && (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className={cn('h-8 flex items-center justify-center text-xs font-medium', calText2)}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">{days}</div>
        </>
      )}
      {viewMode === 'month' && (
        <div className="grid grid-cols-3 gap-2">
          {monthNamesFull.map((m, i) => <button key={m} type="button" onClick={() => handleMonthSelect(i)} className={cn('py-3 rounded-lg text-sm font-medium transition-colors', i === calendarView.month ? calSel : cn(calHover, calText1))}>{m.substring(0,3)}</button>)}
        </div>
      )}
      {viewMode === 'year' && (
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {years.map(y => <button key={y} type="button" onClick={() => handleYearSelect(y)} className={cn('py-3 rounded-lg text-sm font-medium transition-colors', y === calendarView.year ? calSel : cn(calHover, calText1))}>{y}</button>)}
        </div>
      )}
    </div>
  );
};

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const cardGradient = (i) =>
  i % 3 === 0 ? 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50'
  : i % 3 === 1 ? 'bg-gradient-to-br from-purple-50/50 to-pink-50/50'
  : 'bg-gradient-to-br from-green-50/50 to-teal-50/50';

const projGradients = [
  'from-blue-50 to-blue-100','from-purple-50 to-purple-100','from-pink-50 to-pink-100',
  'from-green-50 to-green-100','from-yellow-50 to-yellow-100','from-red-50 to-red-100',
  'from-indigo-50 to-indigo-100','from-teal-50 to-teal-100','from-orange-50 to-orange-100','from-cyan-50 to-cyan-100',
];
const getProjGradient = (i) => projGradients[i % projGradients.length];

const techSuggestions = [
  'JavaScript','Python','Java','C++','C#','PHP','Ruby','Go','Swift','Kotlin',
  'React','Angular','Vue.js','Node.js','Express.js','Django','Flask','Spring Boot',
  'HTML','CSS','Tailwind CSS','Bootstrap','Sass','TypeScript','Next.js','Nuxt.js',
  'MongoDB','MySQL','PostgreSQL','Redis','Firebase','SQL','SQLite','Oracle',
  'AWS','Azure','Google Cloud','Docker','Kubernetes','Git','CI/CD','Jenkins',
  'GraphQL','REST API','WebSocket','Redux','Zustand','Jotai','Recoil',
  'TensorFlow','PyTorch','Scikit-learn','Pandas','NumPy',
  'Figma','Adobe XD','Photoshop','Illustrator','Sketch',
];

const AddPlaceholder = ({ label, subtitle, onClick, dark = false }) => (
  <div onClick={onClick} className={cn('border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 mb-8', dark ? 'bg-[#1a2640] border-slate-700 hover:bg-[#1e2d4d] hover:border-slate-600' : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400')}>
    <div className={cn('w-16 h-16 rounded-full border-2 flex items-center justify-center mb-3', dark ? 'bg-[#131e30] border-slate-700' : 'bg-white border-gray-300')}><PlusIcon /></div>
    <p className={cn('font-medium', dark ? 'text-slate-300' : 'text-gray-600')}>{label}</p>
    <p className={cn('text-sm', dark ? 'text-slate-500' : 'text-gray-400')}>{subtitle}</p>
  </div>
);

const editContentSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  about: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.array(z.any()).default([]),
  projects: z.array(z.any()).default([]),
  education: z.array(z.any()).default([]),
  testimonials: z.array(z.any()).default([]),
  blogs: z.array(z.any()).default([]),
  contact: z.object({
    email: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    twitter: z.string().optional(),
  }).default({ email: '', linkedin: '', github: '', twitter: '' }),
});

const parsePossibleJson = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
};

const splitCsv = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const parseCountedList = (source, prefix, fields, countKey) => {
  const count = Number.parseInt(source?.[countKey] ?? source?.[`${prefix}_count`] ?? 0, 10);
  if (!Number.isFinite(count) || count <= 0) return [];

  const items = [];
  for (let i = 1; i <= count; i += 1) {
    const item = {};
    fields.forEach((field) => {
      item[field] = source?.[`${prefix}_${i}_${field}`] ?? '';
    });
    items.push(item);
  }
  return items;
};

const parseSequentialList = (source, keysBuilder, max = 12) => {
  const items = [];
  for (let i = 1; i <= max; i += 1) {
    const candidate = keysBuilder(i);
    const hasAny = Object.values(candidate).some((value) => String(value || '').trim().length > 0);
    if (hasAny) items.push(candidate);
  }
  return items;
};

const hasNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

const normalizePortfolioToFormData = (payload) => {
  const portfolio = payload?.portfolio || payload || {};
  const fromRaw = parsePossibleJson(portfolio.rawFormData);
  const fromPlaceholders = parsePossibleJson(portfolio.placeholderMap) || {};
  const source = { ...(fromPlaceholders || {}), ...(fromRaw || {}) };

  const flatExperience = parseCountedList(source, 'exp', ['company', 'role', 'duration', 'description', 'highlight'], 'exp_count')
    .map((item) => ({
      company: item.company || '',
      role: item.role || '',
      duration: item.duration || '',
      description: item.description || item.highlight || '',
    }))
    .filter((item) => item.company || item.role || item.duration || item.description);

  const flatProjects = parseCountedList(source, 'project', ['name', 'description', 'tech', 'tagline', 'live_url', 'github_url'], 'project_count')
    .map((item) => ({
      title: item.name || '',
      description: item.description || item.tagline || '',
      technologies: splitCsv(item.tech),
      projectUrl: item.live_url || item.github_url || '',
    }))
    .filter((item) => item.title || item.description || item.technologies.length > 0 || item.projectUrl);

  const flatEducation = parseCountedList(source, 'edu', ['degree', 'institution', 'year', 'grade'], 'edu_count')
    .map((item) => ({
      school: item.institution || '',
      degree: item.degree || '',
      duration: item.year || '',
      description: item.grade ? `Grade: ${item.grade}` : '',
    }))
    .filter((item) => item.school || item.degree || item.duration || item.description);

  const altEducation = parseSequentialList(source, (i) => ({
    school: source?.[`education_${i}_institution`] || source?.[`education_${i}_school`] || source?.[`education_${i}_university`] || '',
    degree: source?.[`education_${i}_degree`] || '',
    duration: source?.[`education_${i}_year`] || source?.[`education_${i}_graduation_year`] || '',
    description: source?.[`education_${i}_grade`] || source?.[`education_${i}_gpa`] || '',
  })).map((item) => ({
    ...item,
    description: item.description ? `Grade: ${item.description}` : '',
  }));

  const flatTestimonials = parseCountedList(source, 'testimonial', ['author', 'role', 'content'], 'testimonial_count')
    .map((item) => ({
      name: item.author || '',
      role: item.role || '',
      company: '',
      text: item.content || '',
    }))
    .filter((item) => item.name || item.role || item.text);

  const altTestimonials = parseSequentialList(source, (i) => ({
    name: source?.[`testimonial_${i}_name`] || source?.[`testimonial_${i}_author`] || '',
    role: source?.[`testimonial_${i}_role`] || '',
    company: source?.[`testimonial_${i}_company`] || '',
    text: source?.[`testimonial_${i}_text`] || source?.[`testimonial_${i}_content`] || '',
  }));

  const fallbackEducation = hasNonEmptyArray(flatEducation) ? flatEducation : altEducation;
  const fallbackTestimonials = hasNonEmptyArray(flatTestimonials) ? flatTestimonials : altTestimonials;

  const skills = Array.isArray(source.skills)
    ? source.skills.map((s) => (typeof s === 'string' ? s : (s?.name || s?.title || '')).trim()).filter(Boolean)
    : splitCsv(source.skills_list || source.skills || source.primary_skills || source.tech_stack);

  const normalizeProject = (project) => ({
        title: project?.title || project?.name || '',
        description: project?.description || project?.summary || '',
        technologies: splitCsv(project?.technologies || project?.tech),
        projectUrl: project?.projectUrl || project?.live_url || project?.url || project?.github_url || '',
      });
  const normalizeEducation = (edu) => ({
    school: edu?.school || edu?.institution || edu?.university || '',
    degree: edu?.degree || '',
    duration: edu?.duration || edu?.year || edu?.graduation_year || '',
    description: edu?.description || (edu?.grade || edu?.gpa ? `Grade: ${edu?.grade || edu?.gpa}` : ''),
  });
  const normalizeTestimonial = (testimonial) => ({
    name: testimonial?.name || testimonial?.author || '',
    role: testimonial?.role || '',
    company: testimonial?.company || '',
    text: testimonial?.text || testimonial?.content || '',
  });

  const experience = hasNonEmptyArray(fromRaw?.experience)
    ? fromRaw.experience
    : hasNonEmptyArray(fromPlaceholders?.experience)
      ? fromPlaceholders.experience
      : flatExperience;
  const projects = hasNonEmptyArray(fromRaw?.projects)
    ? fromRaw.projects.map(normalizeProject)
    : hasNonEmptyArray(fromPlaceholders?.projects)
      ? fromPlaceholders.projects.map(normalizeProject)
      : flatProjects;
  const education = hasNonEmptyArray(fromRaw?.education)
    ? fromRaw.education.map(normalizeEducation)
    : hasNonEmptyArray(fromPlaceholders?.education)
      ? fromPlaceholders.education.map(normalizeEducation)
      : fallbackEducation;
  const testimonials = hasNonEmptyArray(fromRaw?.testimonials)
    ? fromRaw.testimonials.map(normalizeTestimonial)
    : hasNonEmptyArray(fromPlaceholders?.testimonials)
      ? fromPlaceholders.testimonials.map(normalizeTestimonial)
      : fallbackTestimonials;

  return {
    name: source.name || source.fullName || source.personalInfo?.name || '',
    title: source.title || source.headline || source.personalInfo?.title || '',
    about: source.about || source.bio || source.personalInfo?.about || '',
    skills,
    experience,
    projects,
    education,
    testimonials,
    blogs: Array.isArray(source.blogs) ? source.blogs : [],
    contact: {
      email: source.contact?.email || source.email || source.contact_email || '',
      linkedin: source.contact?.linkedin || source.linkedin || source.contact_linkedin || '',
      github: source.contact?.github || source.github || source.contact_github || '',
      twitter: source.contact?.twitter || source.twitter || source.contact_twitter || '',
    },
  };
};

const EditContent = ({ dark = false, portfolioId = null }) => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.portfolio);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');
  const [saveNotice, setSaveNotice] = useState({ type: '', message: '' });

  // Theme tokens
  const t1      = dark ? 'text-white'      : 'text-gray-900';
  const t2      = dark ? 'text-slate-300'  : 'text-gray-600';
  const t3      = dark ? 'text-slate-400'  : 'text-gray-400';
  const inputCls = cn('w-full p-3 border rounded-md focus:outline-none text-base placeholder:text-gray-400 transition-colors',
    dark ? 'bg-[#1a2640] border-slate-700/60 text-white placeholder:text-slate-500 focus:border-violet-500/50'
         : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400');
  const labelCls = dark ? 'block text-slate-300 mb-2 text-sm font-medium' : 'block text-gray-700 mb-2 text-sm font-medium';
  const cardFormCls = cn('p-6 rounded-lg border mb-8', dark ? 'bg-[#1a2640] border-slate-700/60' : 'bg-gray-50 border-gray-200');
  const saveBtnCls  = cn('px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white',
    dark ? 'bg-violet-600 hover:bg-violet-500' : 'bg-gray-900 hover:opacity-90');

  const { control, reset, handleSubmit } = useForm({
    resolver: zodResolver(editContentSchema),
    defaultValues: formData,
  });

  useFieldArray({ control, name: 'skills' });
  useFieldArray({ control, name: 'experience' });
  useFieldArray({ control, name: 'projects' });
  useFieldArray({ control, name: 'education' });
  useFieldArray({ control, name: 'testimonials' });

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  const {
    data: existingPortfolioData,
    isLoading: isFormDataLoading,
    isError: isFormDataError,
    error: formDataError,
    refetch: refetchFormData,
  } = useQuery({
    queryKey: ['edit-portfolio', portfolioId || 'me'],
    queryFn: () => PortfolioService.getMyPortfolio(),
  });

  const effectivePortfolioId = portfolioId || existingPortfolioData?.portfolio?.id || existingPortfolioData?.id || null;

  useEffect(() => {
    if (!existingPortfolioData) return;
    const normalized = normalizePortfolioToFormData(existingPortfolioData);
    dispatch(updateFormData(normalized));
    reset(normalized);
  }, [existingPortfolioData, dispatch, reset]);

  const saveMutation = useMutation({
    mutationFn: (payload) => PortfolioService.update(effectivePortfolioId, { formData: payload }),
    onSuccess: async () => {
      setSaveNotice({ type: 'success', message: 'Changes saved' });
      await queryClient.invalidateQueries({ queryKey: ['edit-portfolio', effectivePortfolioId || 'me'] });
      if (effectivePortfolioId) {
        await queryClient.invalidateQueries({ queryKey: ['dashboard-portfolio', effectivePortfolioId] });
      }
    },
    onError: (err) => {
      const specific = err?.response?.data?.message || err?.message || 'Connection failed, please try again';
      setSaveNotice({ type: 'error', message: `Failed to save - ${specific}` });
    },
  });

  // Skills
  const [currentSkill, setCurrentSkill] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Experience
  const [showExpForm, setShowExpForm] = useState(true);
  const [newExp, setNewExp] = useState({ company:'', role:'', fromDate:null, toDate:null, isPresent:false, description:'' });
  const [showExpFromCal, setShowExpFromCal] = useState(false);
  const [showExpToCal, setShowExpToCal] = useState(false);
  const [expFromView, setExpFromView] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
  const [expToView, setExpToView] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
  const expFromRef = React.useRef(null);
  const expToRef = React.useRef(null);

  // Projects
  const [showProjForm, setShowProjForm] = useState(true);
  const [newProject, setNewProject] = useState({ title:'', description:'', technologies:[], projectUrl:'' });
  const [currentTech, setCurrentTech] = useState('');
  const [showTechSuggestions, setShowTechSuggestions] = useState(false);
  const [filteredTechSuggestions, setFilteredTechSuggestions] = useState([]);

  // Education
  const [showEduForm, setShowEduForm] = useState(true);
  const [newEdu, setNewEdu] = useState({ school:'', degree:'', startDate:null, endDate:null, description:'' });
  const [showEduStartCal, setShowEduStartCal] = useState(false);
  const [showEduEndCal, setShowEduEndCal] = useState(false);
  const [eduStartView, setEduStartView] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
  const [eduEndView, setEduEndView] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
  const eduStartRef = React.useRef(null);
  const eduEndRef = React.useRef(null);

  // Testimonials
  const [showTestiForm, setShowTestiForm] = useState(true);
  const [newTestimonial, setNewTestimonial] = useState({ name:'', role:'', company:'', text:'' });

  const tabs = [
    { id:'personal', label:'Personal Info', icon:<MdPerson style={{ fontSize: 20 }} /> },
    { id:'skills', label:'Skills', icon:<MdOutlinePsychology style={{ fontSize: 20 }} />},
    { id:'experience', label:'Experience', icon:<BiBriefcase style={{ fontSize: 20 }} /> },
    { id:'projects', label:'Projects', icon:<MdOutlineAirplanemodeActive style={{ fontSize: 20 }} /> },
    { id:'education', label:'Education', icon:<MdSchool style={{ fontSize: 20 }} /> },
    { id:'testimonials', label:'Testimonials', icon:<BiMessageRoundedDots style={{ fontSize: 20 }} /> },
    { id:'contact', label:'Contact', icon:<MdEmail style={{ fontSize: 20 }} /> },
  ];

  const formatDate = (date) => {
    if (!date) return '';

    const d = new Date(date);
    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const changeCalMonth = (setter, direction, yearOffset=0) => {
    setter(prev => {
      let m = yearOffset !== 0 ? prev.month : prev.month + direction;
      let y = yearOffset !== 0 ? prev.year + yearOffset : prev.year;
      if (m > 11) { m=0; y++; }
      if (m < 0) { m=11; y--; }
      return { month:m, year:y };
    });
  };

  const getGradientColor = (index) => gradientColors[index % gradientColors.length];

  React.useEffect(() => {
    const handler = (e) => {
      if (expFromRef.current && !expFromRef.current.contains(e.target)) setShowExpFromCal(false);
      if (expToRef.current && !expToRef.current.contains(e.target)) setShowExpToCal(false);
    };
    if (showExpFromCal || showExpToCal) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showExpFromCal, showExpToCal]);

  React.useEffect(() => {
    const handler = (e) => {
      if (eduStartRef.current && !eduStartRef.current.contains(e.target)) setShowEduStartCal(false);
      if (eduEndRef.current && !eduEndRef.current.contains(e.target)) setShowEduEndCal(false);
    };
    if (showEduStartCal || showEduEndCal) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEduStartCal, showEduEndCal]);

  // PERSONAL INFO
  const renderPersonalInfo = () => (
    <div className="w-full">
      <h2 className={cn('text-2xl font-bold mb-6', t1)}>Tell us about yourself</h2>
      <div className="space-y-5">
        <div>
          <label className={labelCls}>Full Name</label>
          <input type="text" value={formData.name||''} onChange={(e)=>dispatch(updateFormData({name:e.target.value}))} className={inputCls} placeholder="e.g. Jane Doe" />
        </div>
        <div>
          <label className={labelCls}>Professional Title</label>
          <input type="text" value={formData.title||''} onChange={(e)=>dispatch(updateFormData({title:e.target.value}))} className={inputCls} placeholder="e.g. Frontend Developer" />
        </div>
        <div>
          <label className={labelCls}>About Me</label>
          <textarea value={formData.about||''} onChange={(e)=>dispatch(updateFormData({about:e.target.value}))} className={inputCls} rows={5} placeholder="Brief introduction..." />
        </div>
      </div>
    </div>
  );

  // SKILLS
  const handleSkillInputChange = (e) => {
    const v = e.target.value; setCurrentSkill(v);
    if (v.trim()) {
      const f = skillSuggestions.filter(s=>s.toLowerCase().includes(v.toLowerCase())&&!formData.skills.includes(s));
      setFilteredSuggestions(f); setShowSuggestions(f.length>0);
    } else setShowSuggestions(false);
  };
  const handleAddSkill = (skillToAdd=null) => {
    const s = skillToAdd||currentSkill.trim();
    if (s&&!formData.skills.includes(s)) { dispatch(addSkill(s)); setCurrentSkill(''); setShowSuggestions(false); }
  };
  const renderSkills = () => (
    <div className="w-full">
      <h2 className={cn('text-2xl font-bold mb-6', t1)}>Skills & Expertise</h2>
      <form onSubmit={(e)=>{e.preventDefault();handleAddSkill();}} className="relative mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input type="text" value={currentSkill} onChange={handleSkillInputChange} onFocus={()=>currentSkill&&setShowSuggestions(filteredSuggestions.length>0)} placeholder="Search and add skills..." className={inputCls} />
            {showSuggestions && (
              <div className={cn('absolute z-10 w-full mt-2 backdrop-blur-xl border rounded-2xl shadow-2xl max-h-64 overflow-hidden', dark ? 'bg-[#1a2640]/95 border-slate-700/60' : 'bg-white/80 border-gray-200/50')}>
                <div className="overflow-y-auto max-h-64 py-2" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
                  {filteredSuggestions.map((s,i)=>(
                    <div key={i} onClick={()=>handleAddSkill(s)} className={cn('px-4 py-2.5 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-150 text-sm font-medium', dark ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')}>{s}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button type="submit" className={cn('px-6 py-3 rounded-lg font-medium transition text-white', dark ? 'bg-violet-600 hover:bg-violet-500' : 'bg-gray-900 hover:opacity-90')}>Add</button>
        </div>
      </form>
      <div className={cn('flex flex-wrap gap-2 min-h-[100px] p-4 rounded-lg border border-dashed mb-4', dark ? 'bg-[#131e30] border-slate-700' : 'bg-gray-50 border-gray-300')}>
        {formData.skills.map((skill,i)=>(
          <div key={i} className={cn('bg-gradient-to-br', getGradientColor(i), dark ? 'text-slate-200 border-slate-600/60' : 'text-gray-700 border-gray-200', 'px-3 py-1.5 rounded-lg flex items-center gap-2 border shadow-sm hover:shadow-md transition-all duration-200 cursor-default h-7')}>
            <span className="text-xs font-medium leading-none">{skill}</span>
            <button onClick={()=>dispatch(removeSkill(skill))} className={cn('rounded-full w-3 h-3 flex items-center justify-center text-xs font-bold leading-none transition-all', dark ? 'text-slate-500 hover:text-red-400 hover:bg-white/10' : 'text-gray-400 hover:text-red-500 hover:bg-white/50')} type="button">x</button>
          </div>
        ))}
        {formData.skills.length===0&&<p className={cn('w-full text-center py-4', t3)}>No skills added yet. Start typing to search and add skills.</p>}
      </div>
    </div>
  );

  // EXPERIENCE
  const handleExpDateSelect = (field, date) => {
    if (field==='toDate'&&newExp.fromDate&&date<newExp.fromDate){alert('End date cannot be before start date');return;}
    if (field==='fromDate'&&newExp.toDate&&date>newExp.toDate) setNewExp(p=>({...p,fromDate:date,toDate:null}));
    else setNewExp(p=>({...p,[field]:date}));
    if(field==='fromDate')setShowExpFromCal(false);
    if(field==='toDate')setShowExpToCal(false);
  };
  const handleAddExp = () => {
    if(newExp.company&&newExp.role&&newExp.fromDate){
      const from=formatDate(newExp.fromDate), to=newExp.isPresent?'Present':formatDate(newExp.toDate);
      dispatch(addExperience({...newExp,duration:`${from} - ${to}`}));
      setNewExp({company:'',role:'',fromDate:null,toDate:null,isPresent:false,description:''});
      setShowExpForm(false);
    } else alert('Please fill in Company, Role, and From Date at minimum.');
  };
  const handleEditExp = (index) => {
    const exp=formData.experience[index];
    const fromDate=new Date(exp.duration.split(' - ')[0]);
    let toDate=null,isPresent=false;
    if(exp.duration.includes('Present'))isPresent=true;
    else toDate=new Date(exp.duration.split(' - ')[1]);
    setNewExp({company:exp.company,role:exp.role,fromDate,toDate,isPresent,description:exp.description||''});
    dispatch(removeExperience(index)); setShowExpForm(true);
  };
  const renderExperience = () => (
    <div className="w-full">
      <h2 className={cn('text-2xl font-bold mb-6', t1)}>Work Experience</h2>
      <div className="space-y-4 mb-8">
        {formData.experience.map((exp,i)=>(
          <div key={i} className={cn('p-4 rounded-lg border relative group', dark ? 'bg-[#1a2640] border-slate-700/60' : 'border-gray-200', cardGradient(i))}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className={cn('font-bold text-lg', t1)}>{exp.role}</h3>
                <div className="text-indigo-500 font-medium">{exp.company}</div>
                <div className={cn('text-sm mb-2', t3)}>{exp.duration}</div>
                <p className={cn('text-sm whitespace-pre-wrap', t2)}>{exp.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>handleEditExp(i)} className="text-gray-400 hover:text-blue-500 p-2" title="Edit"><EditIcon/></button>
                <button onClick={()=>dispatch(removeExperience(i))} className="text-gray-400 hover:text-red-500 p-2" title="Remove"><DeleteIcon/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!showExpForm?(
        <AddPlaceholder label="Add Experience" subtitle="Click to add your work experience" onClick={()=>setShowExpForm(true)} dark={dark}/>
      ):(
        <div className={cardFormCls}>
          <h3 className={cn('text-lg font-semibold mb-4', t1)}>Add Work Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>Role / Job Title</label>
              <input type="text" value={newExp.role} onChange={(e)=>setNewExp(p=>({...p,role:e.target.value}))} className={inputCls} placeholder="e.g. Senior Developer" autoComplete="off"/>
            </div>
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>Company</label>
              <input type="text" value={newExp.company} onChange={(e)=>setNewExp(p=>({...p,company:e.target.value}))} className={inputCls} placeholder="e.g. Google" autoComplete="off"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>From Date</label>
              <div className="relative" ref={expFromRef}>
                <button type="button" onClick={()=>setShowExpFromCal(!showExpFromCal)} className={cn('w-full p-2.5 border rounded-md outline-none text-left transition-colors flex items-center justify-between', dark ? 'bg-[#1a2640] border-slate-700/60 hover:bg-[#1e2d4d]' : 'bg-white border-gray-300 hover:bg-gray-50')}>
                  <span className={newExp.fromDate?t1:t3}>{newExp.fromDate?formatDate(newExp.fromDate):'Select date'}</span><CalendarIcon/>
                </button>
                <CalendarPicker calendarView={expFromView} onDateSelect={(d)=>handleExpDateSelect('fromDate',d)} onMonthChange={(dir)=>changeCalMonth(setExpFromView,dir)} onYearChange={(y)=>setExpFromView(p=>({...p,year:y}))} show={showExpFromCal} selectedDate={newExp.fromDate} dark={dark}/>
              </div>
            </div>
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>To Date</label>
              <div className="relative" ref={expToRef}>
                <button type="button" onClick={()=>!newExp.isPresent&&setShowExpToCal(!showExpToCal)} disabled={newExp.isPresent} className={cn('w-full p-2.5 border rounded-md outline-none text-left transition-colors disabled:cursor-not-allowed flex items-center justify-between', dark ? 'bg-[#1a2640] border-slate-700/60 hover:bg-[#1e2d4d] disabled:bg-slate-800/50' : 'bg-white border-gray-300 hover:bg-gray-50 disabled:bg-gray-100')}>
                  <span className={newExp.isPresent||newExp.toDate?t1:t3}>{newExp.isPresent?'Present':(newExp.toDate?formatDate(newExp.toDate):'Select date')}</span><CalendarIcon/>
                </button>
                <CalendarPicker calendarView={expToView} onDateSelect={(d)=>handleExpDateSelect('toDate',d)} onMonthChange={(dir)=>changeCalMonth(setExpToView,dir)} onYearChange={(y)=>setExpToView(p=>({...p,year:y}))} show={showExpToCal&&!newExp.isPresent} selectedDate={newExp.toDate} dark={dark}/>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer" onClick={(e)=>{if(e.target.tagName!=='INPUT')setNewExp(p=>({...p,isPresent:!p.isPresent,toDate:!p.isPresent?null:p.toDate}));}}>
              <div className="relative">
                <input type="checkbox" checked={newExp.isPresent} onChange={(e)=>setNewExp(p=>({...p,isPresent:e.target.checked,toDate:e.target.checked?null:p.toDate}))} className={cn('w-5 h-5 border-2 rounded cursor-pointer focus:ring-0 focus:outline-none appearance-none', dark ? 'bg-slate-800 border-violet-500 checked:bg-violet-600' : 'bg-white border-gray-800 checked:bg-gray-800')}/>
                {newExp.isPresent&&<svg className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
              </div>
              <span className={cn('text-sm font-medium', t2)}>I currently work here</span>
            </label>
          </div>
          <div className="mb-4 space-y-1">
            <label className={cn('text-xs font-medium uppercase', t3)}>Description / Achievements</label>
            <textarea value={newExp.description} onChange={(e)=>setNewExp(p=>({...p,description:e.target.value}))} rows="3" className={inputCls} placeholder="What did you achieve here?"/>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddExp} className={cn('flex-1 py-2.5 rounded-lg transition font-medium text-white', dark ? 'bg-violet-600 hover:bg-violet-500' : 'bg-gray-900 hover:opacity-90')}>Save Experience</button>
            <button onClick={()=>setShowExpForm(false)} className={cn('flex-1 py-2.5 rounded-lg transition font-medium', dark ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  // PROJECTS
  const handleTechInputChange = (e) => {
    const v=e.target.value; setCurrentTech(v);
    if(v.trim()){const f=techSuggestions.filter(t=>t.toLowerCase().includes(v.toLowerCase())&&!newProject.technologies.includes(t));setFilteredTechSuggestions(f);setShowTechSuggestions(f.length>0);}
    else setShowTechSuggestions(false);
  };
  const handleAddTech=(tech)=>{if(tech&&!newProject.technologies.includes(tech)){setNewProject(p=>({...p,technologies:[...p.technologies,tech]}));setCurrentTech('');setShowTechSuggestions(false);}};
  const handleRemoveTech=(tech)=>setNewProject(p=>({...p,technologies:p.technologies.filter(t=>t!==tech)}));
  const handleAddProject=()=>{
    if(newProject.title&&newProject.description){dispatch(addProject({...newProject}));setNewProject({title:'',description:'',technologies:[],projectUrl:''});setShowProjForm(false);}
    else alert('Please fill in Title and Description at minimum.');
  };
  const handleEditProject=(index)=>{
    const proj=formData.projects[index];
    setNewProject({title:proj.title,description:proj.description||'',technologies:Array.isArray(proj.technologies)?proj.technologies:[],projectUrl:proj.projectUrl||''});
    dispatch(removeProject(index)); setShowProjForm(true);
  };
  const renderProjects = () => (
    <div className="w-full">
      <h2 className={cn('text-2xl font-bold mb-6', t1)}>Projects</h2>
      <div className="space-y-4 mb-8">
        {formData.projects.map((proj,i)=>(
          <div key={i} className={cn('p-4 rounded-lg border relative group', dark ? 'bg-[#1a2640] border-slate-700/60' : 'border-gray-200', cardGradient(i))}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className={cn('font-bold text-lg', t1)}>{proj.title}</h3>
                <p className={cn('text-sm whitespace-pre-wrap mb-2', t2)}>{proj.description}</p>
                {proj.technologies&&proj.technologies.length>0&&(
                  <div className="flex flex-wrap gap-2 mb-2">
                    {proj.technologies.map((tech,ti)=>(
                      <div key={ti} className={`bg-gradient-to-br ${getProjGradient(ti)} text-gray-700 px-2 py-1 rounded-lg flex items-center border border-gray-200 shadow-sm h-6`}>
                        <span className="text-xs font-medium leading-none">{tech}</span>
                      </div>
                    ))}
                  </div>
                )}
                {proj.projectUrl&&<a href={proj.projectUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline">View Project arrow</a>}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>handleEditProject(i)} className="text-gray-400 hover:text-blue-500 p-2" title="Edit"><EditIcon/></button>
                <button onClick={()=>dispatch(removeProject(i))} className="text-gray-400 hover:text-red-500 p-2" title="Remove"><DeleteIcon/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!showProjForm?(
        <AddPlaceholder label="Add Project" subtitle="Click to add your project" onClick={()=>setShowProjForm(true)} dark={dark}/>
      ):(
        <div className={cardFormCls}>
          <h3 className={cn('text-lg font-semibold mb-4', t1)}>Add Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>Project Title</label>
              <input type="text" value={newProject.title} onChange={(e)=>setNewProject(p=>({...p,title:e.target.value}))} className={inputCls} placeholder="e.g. E-commerce Platform" autoComplete="off"/>
            </div>
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>Project URL (Optional)</label>
              <input type="text" value={newProject.projectUrl} onChange={(e)=>setNewProject(p=>({...p,projectUrl:e.target.value}))} className={inputCls} placeholder="https://..." autoComplete="off"/>
            </div>
          </div>
          <div className="mb-4 space-y-1">
            <label className={cn('text-xs font-medium uppercase', t3)}>Technologies Used</label>
            <div className="relative">
              <div className={cn('flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]', dark ? 'bg-[#1a2640] border-slate-700/60' : 'bg-white border-gray-300')}>
                {newProject.technologies.map((tech,ti)=>(
                  <div key={ti} className={`bg-gradient-to-br ${getProjGradient(ti)} text-gray-700 px-2 py-1 rounded-lg flex items-center gap-1.5 border border-gray-200 shadow-sm h-6`}>
                    <span className="text-xs font-medium leading-none">{tech}</span>
                    <button onClick={()=>handleRemoveTech(tech)} className="text-gray-400 hover:text-red-500 rounded-full w-3 h-3 flex items-center justify-center text-xs font-bold leading-none transition-all" type="button">x</button>
                  </div>
                ))}
                <input type="text" value={currentTech} onChange={handleTechInputChange} className={cn('flex-1 min-w-[120px] outline-none bg-transparent', dark ? 'text-white placeholder:text-slate-500' : '')} placeholder={newProject.technologies.length===0?'Search technologies...':''} autoComplete="off"/>
              </div>
              {showTechSuggestions&&(
                <div className={cn('absolute z-10 w-full mt-2 border rounded-2xl shadow-2xl max-h-64 overflow-hidden', dark ? 'bg-[#1a2640]/95 border-slate-700/60' : 'bg-white/80 backdrop-blur-xl border-gray-200/50')}>
                  <div className="overflow-y-auto max-h-64 py-2" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
                    {filteredTechSuggestions.map((tech,i)=><div key={i} onClick={()=>handleAddTech(tech)} className={cn('px-4 py-2.5 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-150 text-sm font-medium', dark ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')}>{tech}</div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mb-4 space-y-1">
            <label className={cn('text-xs font-medium uppercase', t3)}>Description</label>
            <textarea value={newProject.description} onChange={(e)=>setNewProject(p=>({...p,description:e.target.value}))} rows="4" className={inputCls} placeholder="What did you build and what was your role?"/>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleAddProject} className={cn('flex-1 py-2.5 px-4 rounded-md transition font-medium text-white', dark ? 'bg-violet-600 hover:bg-violet-500' : 'bg-gray-900 hover:opacity-90')}>Save Project</button>
            <button type="button" onClick={()=>{setNewProject({title:'',description:'',technologies:[],projectUrl:''});setShowProjForm(false);}} className={cn('flex-1 px-6 py-2.5 border rounded-md transition font-medium', dark ? 'border-slate-700 text-slate-300 hover:bg-slate-700/30' : 'border-gray-300 text-gray-700 hover:bg-gray-100')}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  // EDUCATION
  const handleEduDateSelect=(field,date)=>{
    if(field==='endDate'&&newEdu.startDate&&date<newEdu.startDate){alert('End date cannot be before start date');return;}
    if(field==='startDate'&&newEdu.endDate&&date>newEdu.endDate)setNewEdu(p=>({...p,startDate:date,endDate:null}));
    else setNewEdu(p=>({...p,[field]:date}));
    if(field==='startDate')setShowEduStartCal(false);
    if(field==='endDate')setShowEduEndCal(false);
  };
  const handleAddEdu=()=>{
    if(newEdu.school&&newEdu.degree&&newEdu.startDate){
      const s=formatDate(newEdu.startDate),e=newEdu.endDate?formatDate(newEdu.endDate):'Present';
      dispatch(addEducation({...newEdu,duration:`${s} - ${e}`}));
      setNewEdu({school:'',degree:'',startDate:null,endDate:null,description:''}); setShowEduForm(false);
    } else alert('Please fill in School, Degree, and Start Date at minimum.');
  };
  const handleEditEdu=(index)=>{
    const edu=formData.education[index];
    const startDate=new Date(edu.duration.split(' - ')[0]);
    let endDate=null;
    if(!edu.duration.includes('Present'))endDate=new Date(edu.duration.split(' - ')[1]);
    setNewEdu({school:edu.school,degree:edu.degree,startDate,endDate,description:edu.description||''});
    dispatch(removeEducation(index)); setShowEduForm(true);
  };
  const renderEducation = () => (
    <div className="w-full">
      <h2 className={cn('text-2xl font-bold mb-6', t1)}>Education</h2>
      <div className="space-y-4 mb-8">
        {formData.education.map((edu,i)=>(
          <div key={i} className={cn('p-4 rounded-lg border relative group', dark ? 'bg-[#1a2640] border-slate-700/60' : 'border-gray-200', cardGradient(i))}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className={cn('font-bold text-lg', t1)}>{edu.degree}</h3>
                <div className="text-indigo-500 font-medium">{edu.school}</div>
                <div className={cn('text-sm mb-2', t3)}>{edu.duration}</div>
                {edu.description&&<p className={cn('text-sm whitespace-pre-wrap', t2)}>{edu.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>handleEditEdu(i)} className="text-gray-400 hover:text-blue-500 p-2" title="Edit"><EditIcon/></button>
                <button onClick={()=>dispatch(removeEducation(i))} className="text-gray-400 hover:text-red-500 p-2" title="Remove"><DeleteIcon/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!showEduForm?(
        <AddPlaceholder label="Add Education" subtitle="Click to add your education" onClick={()=>setShowEduForm(true)} dark={dark}/>
      ):(
        <div className={cardFormCls}>
          <h3 className={cn('text-lg font-semibold mb-4', t1)}>Add Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>School / University</label>
              <input type="text" value={newEdu.school} onChange={(e)=>setNewEdu(p=>({...p,school:e.target.value}))} className={inputCls} placeholder="e.g. Stanford University" autoComplete="off"/>
            </div>
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>Degree</label>
              <input type="text" value={newEdu.degree} onChange={(e)=>setNewEdu(p=>({...p,degree:e.target.value}))} className={inputCls} placeholder="e.g. BS Computer Science" autoComplete="off"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>Start Date</label>
              <div className="relative" ref={eduStartRef}>
                <button type="button" onClick={()=>setShowEduStartCal(!showEduStartCal)} className={cn('w-full p-2.5 border rounded-md outline-none text-left transition-colors flex items-center justify-between', dark ? 'bg-[#1a2640] border-slate-700/60 hover:bg-[#1e2d4d]' : 'bg-white border-gray-300 hover:bg-gray-50')}>
                  <span className={newEdu.startDate?t1:t3}>{newEdu.startDate?formatDate(newEdu.startDate):'Select date'}</span><CalendarIcon/>
                </button>
                <CalendarPicker calendarView={eduStartView} onDateSelect={(d)=>handleEduDateSelect('startDate',d)} onMonthChange={(dir)=>changeCalMonth(setEduStartView,dir)} onYearChange={(y)=>setEduStartView(p=>({...p,year:y}))} show={showEduStartCal} selectedDate={newEdu.startDate} dark={dark}/>
              </div>
            </div>
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>End Date (Optional)</label>
              <div className="relative" ref={eduEndRef}>
                <button type="button" onClick={()=>setShowEduEndCal(!showEduEndCal)} className={cn('w-full p-2.5 border rounded-md outline-none text-left transition-colors flex items-center justify-between', dark ? 'bg-[#1a2640] border-slate-700/60 hover:bg-[#1e2d4d]' : 'bg-white border-gray-300 hover:bg-gray-50')}>
                  <span className={newEdu.endDate?t1:t3}>{newEdu.endDate?formatDate(newEdu.endDate):'Select date or leave for Present'}</span><CalendarIcon/>
                </button>
                <CalendarPicker calendarView={eduEndView} onDateSelect={(d)=>handleEduDateSelect('endDate',d)} onMonthChange={(dir)=>changeCalMonth(setEduEndView,dir)} onYearChange={(y)=>setEduEndView(p=>({...p,year:y}))} show={showEduEndCal} selectedDate={newEdu.endDate} dark={dark}/>
              </div>
            </div>
          </div>
          <div className="mb-4 space-y-1">
            <label className={cn('text-xs font-medium uppercase', t3)}>Description (Optional)</label>
            <textarea value={newEdu.description} onChange={(e)=>setNewEdu(p=>({...p,description:e.target.value}))} rows="3" className={inputCls} placeholder="e.g. GPA 3.9, Dean's List, Relevant Coursework..."/>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleAddEdu} className={cn('flex-1 py-2.5 px-4 rounded-md transition font-medium text-white', dark ? 'bg-violet-600 hover:bg-violet-500' : 'bg-gray-900 hover:opacity-90')}>Save Education</button>
            <button type="button" onClick={()=>{setNewEdu({school:'',degree:'',startDate:null,endDate:null,description:''});setShowEduForm(false);}} className={cn('flex-1 px-6 py-2.5 border rounded-md transition font-medium', dark ? 'border-slate-700 text-slate-300 hover:bg-slate-700/30' : 'border-gray-300 text-gray-700 hover:bg-gray-100')}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  // TESTIMONIALS
  const handleAddTestimonial=()=>{
    if(newTestimonial.name&&newTestimonial.text){dispatch(addTestimonial({...newTestimonial}));setNewTestimonial({name:'',role:'',company:'',text:''});setShowTestiForm(false);}
    else alert('Please fill in Name and Testimonial Text.');
  };
  const handleEditTestimonial=(index)=>{
    const t=formData.testimonials[index];
    setNewTestimonial({name:t.name,role:t.role||'',company:t.company||'',text:t.text});
    dispatch(removeTestimonial(index)); setShowTestiForm(true);
  };
  const renderTestimonials = () => (
    <div className="w-full">
      <h2 className={cn('text-2xl font-bold mb-6', t1)}>Testimonials</h2>
      <p className={cn('mb-6 text-sm', t3)}>Add recommendations from colleagues, mentors, or clients to build credibility.</p>
      <div className="space-y-4 mb-8">
        {formData.testimonials.map((item,i)=>(
          <div key={i} className={cn('p-4 rounded-lg border relative group', dark ? 'bg-[#1a2640] border-slate-700/60' : 'border-gray-200', cardGradient(i))}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className={cn('mb-3 text-sm italic', t2)}>&#34;{item.text}&#34;</p>
                <div className={cn('font-bold', t1)}>{item.name}</div>
                {(item.role||item.company)&&<div className={cn('text-sm', t2)}>{item.role&&item.company?`${item.role} at ${item.company}`:item.role||item.company}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>handleEditTestimonial(i)} className="text-gray-400 hover:text-blue-500 p-2" title="Edit"><EditIcon/></button>
                <button onClick={()=>dispatch(removeTestimonial(i))} className="text-gray-400 hover:text-red-500 p-2" title="Remove"><DeleteIcon/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!showTestiForm?(
        <AddPlaceholder label="Add Testimonial" subtitle="Click to add a recommendation" onClick={()=>setShowTestiForm(true)} dark={dark}/>
      ):(
        <div className={cardFormCls}>
          <h3 className={cn('text-lg font-semibold mb-4', t1)}>Add Recommendation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>Name</label>
              <input type="text" value={newTestimonial.name} onChange={(e)=>setNewTestimonial(p=>({...p,name:e.target.value}))} className={inputCls} placeholder="e.g. Alex Johnson" autoComplete="off"/>
            </div>
            <div className="space-y-1">
              <label className={cn('text-xs font-medium uppercase', t3)}>Role / Position</label>
              <input type="text" value={newTestimonial.role} onChange={(e)=>setNewTestimonial(p=>({...p,role:e.target.value}))} className={inputCls} placeholder="e.g. Project Manager" autoComplete="off"/>
            </div>
          </div>
          <div className="mb-4 space-y-1">
            <label className={cn('text-xs font-medium uppercase', t3)}>Company / Organization (Optional)</label>
            <input type="text" value={newTestimonial.company} onChange={(e)=>setNewTestimonial(p=>({...p,company:e.target.value}))} className={inputCls} placeholder="e.g. Tech Corp" autoComplete="off"/>
          </div>
          <div className="mb-4 space-y-1">
            <label className={cn('text-xs font-medium uppercase', t3)}>Recommendation Text</label>
            <textarea value={newTestimonial.text} onChange={(e)=>setNewTestimonial(p=>({...p,text:e.target.value}))} rows="4" className={inputCls} placeholder="What did they say about your work?" autoComplete="off"/>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleAddTestimonial} className={cn('flex-1 py-2.5 px-4 rounded-md transition font-medium text-white', dark ? 'bg-violet-600 hover:bg-violet-500' : 'bg-gray-900 hover:opacity-90')}>Save Testimonial</button>
            <button type="button" onClick={()=>{setNewTestimonial({name:'',role:'',company:'',text:''});setShowTestiForm(false);}} className={cn('flex-1 px-6 py-2.5 border rounded-md transition font-medium', dark ? 'border-slate-700 text-slate-300 hover:bg-slate-700/30' : 'border-gray-300 text-gray-700 hover:bg-gray-100')}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  // CONTACT
  const renderContact = () => (
    <div className="w-full">
      <h2 className={cn('text-2xl font-bold mb-6', t1)}>How can people reach you?</h2>
      <div className="space-y-4">
        {[
          { label: 'Email',         key: 'email',    type: 'email', placeholder: 'you@example.com' },
          { label: 'LinkedIn URL',  key: 'linkedin', type: 'text',  placeholder: 'linkedin.com/in/...' },
          { label: 'GitHub URL',    key: 'github',   type: 'text',  placeholder: 'github.com/...' },
          { label: 'Twitter / X URL', key: 'twitter', type: 'text', placeholder: 'twitter.com/...' },
        ].map(field => (
          <div key={field.key}>
            <label className={labelCls}>{field.label}</label>
            <input type={field.type} value={formData.contact?.[field.key]||''} onChange={(e)=>dispatch(updateContact({[field.key]:e.target.value}))} className={inputCls} placeholder={field.placeholder}/>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab){
      case 'personal': return renderPersonalInfo();
      case 'skills': return renderSkills();
      case 'experience': return renderExperience();
      case 'projects': return renderProjects();
      case 'education': return renderEducation();
      case 'testimonials': return renderTestimonials();
      case 'contact': return renderContact();
      default: return null;
    }
  };

  const onValidSubmit = () => {
    if (!effectivePortfolioId) {
      setSaveNotice({ type: 'error', message: 'Portfolio not found. Please generate your portfolio first.' });
      return;
    }
    setSaveNotice({ type: '', message: '' });
    // Inputs are controlled through Redux state, so persist the Redux snapshot.
    const sanitizedPayload = JSON.parse(JSON.stringify(formData || {}));
    saveMutation.mutate(sanitizedPayload);
  };

  const onInvalidSubmit = () => {
    setSaveNotice({ type: 'error', message: 'Failed to save - please fix validation errors and try again.' });
  };

  const handleSaveChanges = handleSubmit(onValidSubmit, onInvalidSubmit);

  if (isFormDataLoading) {
    return (
      <div className="space-y-6">
        <div className={cn('p-6 rounded-2xl border animate-pulse', dark ? 'bg-[#0f1829] border-slate-700/60' : 'bg-gray-50 border-gray-200')}>
          <div className={cn('h-6 w-56 rounded mb-3', dark ? 'bg-slate-700' : 'bg-gray-200')} />
          <div className={cn('h-4 w-96 rounded', dark ? 'bg-slate-700/70' : 'bg-gray-200/80')} />
        </div>
        <div className={cn('rounded-2xl border p-6 space-y-4 animate-pulse', dark ? 'bg-[#0f1829] border-slate-700/60' : 'bg-white border-gray-200')}>
          <div className={cn('h-4 w-32 rounded', dark ? 'bg-slate-700' : 'bg-gray-200')} />
          <div className={cn('h-10 w-full rounded', dark ? 'bg-slate-700/70' : 'bg-gray-200/80')} />
          <div className={cn('h-10 w-full rounded', dark ? 'bg-slate-700/70' : 'bg-gray-200/80')} />
          <div className={cn('h-24 w-full rounded', dark ? 'bg-slate-700/70' : 'bg-gray-200/80')} />
        </div>
      </div>
    );
  }

  if (isFormDataError) {
    const msg = formDataError?.response?.data?.message || formDataError?.message || 'Failed to load existing data';
    return (
      <div className={cn('rounded-2xl border p-6', dark ? 'bg-[#0f1829] border-rose-700/50' : 'bg-rose-50 border-rose-200')}>
        <p className={cn('text-sm mb-4', dark ? 'text-rose-300' : 'text-rose-700')}>{msg}</p>
        <button onClick={() => refetchFormData()} className={cn('px-4 py-2 rounded-lg text-sm font-semibold', dark ? 'bg-rose-600 text-white' : 'bg-rose-600 text-white')}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cn('p-6 rounded-2xl border', dark ? 'bg-[#0f1829] border-slate-700/60' : 'bg-gray-50/50 border-gray-200/60')}>
        <h2 className={cn('text-2xl font-bold mb-2', t1)}>Edit Website Content</h2>
        <p className={t2}>Update your portfolio data across all sections. Changes are applied to your current template.</p>
      </div>
      <div className={cn('rounded-2xl border overflow-hidden', dark ? 'bg-[#0f1829] border-slate-700/60' : 'bg-gray-50/50 border-gray-200/60')}>
        <div className={cn('flex overflow-x-auto scrollbar-hide border-b', dark ? 'border-slate-700/60' : 'border-gray-200/60')}>
          {tabs.map((tab)=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={cn(
              'flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-all duration-300 text-sm',
              activeTab===tab.id
                ? (dark ? 'bg-[#131e30] text-white border-b-2 border-violet-500' : 'bg-white text-gray-900 border-b-2 border-gray-900')
                : (dark ? 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200' : 'text-gray-600 hover:bg-white/40')
            )}>
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className={cn('p-6 min-h-[400px]', dark ? 'bg-[#131e30]' : 'bg-white')}>
          {renderTabContent()}
        </div>
      </div>
      {saveNotice.message && (
        <div className={cn(
          'rounded-xl border px-4 py-3 text-sm',
          saveNotice.type === 'success' && (dark ? 'bg-emerald-900/20 border-emerald-700/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'),
          saveNotice.type === 'error' && (dark ? 'bg-rose-900/20 border-rose-700/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700')
        )}>
          {saveNotice.message}
        </div>
      )}
      <div className="flex justify-end">
        <button onClick={handleSaveChanges} disabled={saveMutation.isPending} className={saveBtnCls}>
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <div className={cn('border rounded-xl p-4', dark ? 'bg-violet-900/20 border-violet-700/40' : 'bg-blue-50/50 border-blue-200/60')}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h4 className={cn('font-semibold mb-1', dark ? 'text-violet-300' : 'text-blue-900')}>How it works</h4>
            <ul className={cn('text-sm space-y-1', dark ? 'text-violet-300/80' : 'text-blue-800')}>
              <li>Edit your content in any section tab above</li>
              <li>Click "Save Changes" to update your live website</li>
              <li>Empty sections won't appear on your portfolio</li>
              <li>To change template design, go to "Manage Template" tab</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditContent;
