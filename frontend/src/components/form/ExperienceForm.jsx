import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addExperience, removeExperience, nextStep, prevStep } from '../../features/portfolioSlice';
import { useFormTheme, cn, inp, lbl, btnPrimary, btnSecondary, cardBox, addBox, itemCard } from './useFormTheme';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];

const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
};

const CalendarPicker = ({ calendarView, onDateSelect, onMonthChange, show, selectedDate, onYearChange, dark }) => {
    const [viewMode, setViewMode] = React.useState('date');
    const calendarRef = React.useRef(null);
    
    const daysInMonth = getDaysInMonth(calendarView.month, calendarView.year);
    const firstDay = getFirstDayOfMonth(calendarView.month, calendarView.year);
    const days = [];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

    // Reset to date view when calendar is closed/opened
    React.useEffect(() => {
        if (show) {
            setViewMode('date');
        }
    }, [show]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                // Calendar will be closed by parent component
            }
        };

        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show]);

    const handleYearSelect = (year) => {
        onYearChange(year);
        setViewMode('month');
    };

    const handleMonthSelect = (monthIndex) => {
        const monthDiff = monthIndex - calendarView.month;
        onMonthChange(monthDiff);
        setViewMode('date');
    };

    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(calendarView.year, calendarView.month, day);
        const isSelected = selectedDate && 
            new Date(selectedDate).toDateString() === date.toDateString();
        
        days.push(
            <button
                key={day}
                type="button"
                onClick={() => onDateSelect(date.toISOString())}
                className={`h-8 rounded-lg text-sm font-medium transition-colors ${
                    isSelected 
                        ? dark ? 'bg-violet-500/25 text-violet-300 font-bold' : 'bg-violet-100 text-violet-700 font-bold'
                        : dark ? 'hover:bg-slate-700/60 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
            >
                {day}
            </button>
        );
    }

    if (!show) return null;

    return (
        <div ref={calendarRef} className={cn('absolute z-20 mt-1 rounded-2xl shadow-2xl p-4 w-72 border', dark ? 'bg-[#0d1525] border-slate-700/60' : 'bg-white border-slate-200')}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <button
                    type="button"
                    onClick={() => {
                        if (viewMode === 'date') onMonthChange(-1);
                        else if (viewMode === 'month') onMonthChange(0, -1);
                    }}
                    className={cn('p-1 rounded-lg transition-colors', dark ? 'hover:bg-slate-700/60 text-slate-400' : 'hover:bg-slate-100 text-slate-600')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <div className="flex items-center gap-2">
                    {viewMode === 'date' && (
                        <button
                            type="button"
                            onClick={() => setViewMode('year')}
                            className={cn('font-semibold px-3 py-1 rounded-lg transition-colors', dark ? 'text-white hover:bg-slate-700/60' : 'text-slate-800 hover:bg-slate-100')}
                        >
                            {monthNamesFull[calendarView.month]} {calendarView.year}
                        </button>
                    )}
                    {viewMode === 'month' && (
                        <button
                            type="button"
                            onClick={() => setViewMode('year')}
                            className={cn('font-semibold px-3 py-1 rounded-lg transition-colors', dark ? 'text-white hover:bg-slate-700/60' : 'text-slate-800 hover:bg-slate-100')}
                        >
                            {calendarView.year}
                        </button>
                    )}
                    {viewMode === 'year' && (
                        <div className={cn('font-semibold px-3 py-1', dark ? 'text-white' : 'text-slate-800')}>
                            Select Year
                        </div>
                    )}
                </div>
                
                <button
                    type="button"
                    onClick={() => {
                        if (viewMode === 'date') onMonthChange(1);
                        else if (viewMode === 'month') onMonthChange(0, 1);
                    }}
                    className={cn('p-1 rounded-lg transition-colors', dark ? 'hover:bg-slate-700/60 text-slate-400' : 'hover:bg-slate-100 text-slate-600')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            
            {/* Content Area */}
            {viewMode === 'date' && (
                <>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className={cn('h-8 flex items-center justify-center text-xs font-medium', dark ? 'text-slate-500' : 'text-slate-400')}>
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days}
                    </div>
                </>
            )}
            
            {viewMode === 'month' && (
                <div className="grid grid-cols-3 gap-2">
                    {monthNamesFull.map((month, index) => (
                        <button
                            key={month}
                            type="button"
                            onClick={() => handleMonthSelect(index)}
                            className={cn('py-3 rounded-lg text-sm font-medium transition-colors', index === calendarView.month ? dark ? 'bg-violet-500/25 text-violet-300' : 'bg-violet-100 text-violet-700' : dark ? 'hover:bg-slate-700/60 text-slate-300' : 'hover:bg-slate-100 text-slate-700')}
                        >
                            {month.substring(0, 3)}
                        </button>
                    ))}
                </div>
            )}
            
            {viewMode === 'year' && (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {years.map((year) => (
                        <button
                            key={year}
                            type="button"
                            onClick={() => handleYearSelect(year)}
                            className={cn('py-3 rounded-lg text-sm font-medium transition-colors', year === calendarView.year ? dark ? 'bg-violet-500/25 text-violet-300' : 'bg-violet-100 text-violet-700' : dark ? 'hover:bg-slate-700/60 text-slate-300' : 'hover:bg-slate-100 text-slate-700')}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ExperienceForm = () => {
    const dispatch = useDispatch();
    const dark = useFormTheme();
    const { formData } = useSelector((state) => state.portfolio);
    const [showForm, setShowForm] = useState(true);
    const [showFromCalendar, setShowFromCalendar] = useState(false);
    const [showToCalendar, setShowToCalendar] = useState(false);
    const fromDateRef = React.useRef(null);
    const toDateRef = React.useRef(null);
    
    // Local state for the form inputs
    const [newExp, setNewExp] = useState({
        company: '',
        role: '',
        fromDate: null,
        toDate: null,
        isPresent: false,
        description: ''
    });

    const [fromCalendarView, setFromCalendarView] = useState({ 
        month: new Date().getMonth(), 
        year: new Date().getFullYear() 
    });
    const [toCalendarView, setToCalendarView] = useState({ 
        month: new Date().getMonth(), 
        year: new Date().getFullYear() 
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewExp(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'isPresent' && checked ? { toDate: null } : {})
        }));
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    };

    // Close calendar when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (fromDateRef.current && !fromDateRef.current.contains(event.target)) {
                setShowFromCalendar(false);
            }
            if (toDateRef.current && !toDateRef.current.contains(event.target)) {
                setShowToCalendar(false);
            }
        };

        if (showFromCalendar || showToCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFromCalendar, showToCalendar]);

    const handleDateSelect = (field, date) => {
        if (field === 'toDate' && newExp.fromDate && date < newExp.fromDate) {
            alert('End date cannot be before start date');
            return;
        }
        if (field === 'fromDate' && newExp.toDate && date > newExp.toDate) {
            setNewExp(prev => ({ ...prev, [field]: date, toDate: null }));
        } else {
            setNewExp(prev => ({ ...prev, [field]: date }));
        }
        if (field === 'fromDate') setShowFromCalendar(false);
        if (field === 'toDate') setShowToCalendar(false);
    };

    const changeMonth = (calendar, direction, yearOffset = 0) => {
        if (calendar === 'from') {
            setFromCalendarView(prev => {
                let newMonth = yearOffset !== 0 ? prev.month : prev.month + direction;
                let newYear = yearOffset !== 0 ? prev.year + yearOffset : prev.year;
                if (newMonth > 11) { newMonth = 0; newYear++; }
                if (newMonth < 0) { newMonth = 11; newYear--; }
                return { month: newMonth, year: newYear };
            });
        } else {
            setToCalendarView(prev => {
                let newMonth = yearOffset !== 0 ? prev.month : prev.month + direction;
                let newYear = yearOffset !== 0 ? prev.year + yearOffset : prev.year;
                if (newMonth > 11) { newMonth = 0; newYear++; }
                if (newMonth < 0) { newMonth = 11; newYear--; }
                return { month: newMonth, year: newYear };
            });
        }
    };

    const handleAdd = () => {
        if (newExp.company && newExp.role && newExp.fromDate) {
            const fromDate = formatDate(newExp.fromDate);
            const toDate = newExp.isPresent ? 'Present' : formatDate(newExp.toDate);
            const duration = `${fromDate} - ${toDate}`;
            dispatch(addExperience({ ...newExp, duration }));
            setNewExp({ company: '', role: '', fromDate: null, toDate: null, isPresent: false, description: '' });
            setShowForm(false);
        } else {
            alert("Please fill in Company, Role, and From Date at minimum.");
        }
    };

    const handleEdit = (index) => {
        const exp = formData.experience[index];
        const fromDate = new Date(exp.duration.split(' - ')[0]);
        let toDate = null;
        let isPresent = false;
        if (exp.duration.includes('Present')) {
            isPresent = true;
        } else {
            toDate = new Date(exp.duration.split(' - ')[1]);
        }
        setNewExp({ 
            company: exp.company, 
            role: exp.role, 
            fromDate, 
            toDate, 
            isPresent, 
            description: exp.description || '' 
        });
        dispatch(removeExperience(index));
        setShowForm(true);
    };

    return (
        <div className="space-y-5">

            {/* List Existing Experiences */}
            <div className="space-y-3">
                {formData.experience.map((exp, index) => (
                    <div 
                        key={index}
                        className={itemCard(dark, index)}
                    >
                         <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className={cn('font-bold', dark ? 'text-white' : 'text-slate-900')}>{exp.role}</h3>
                                <div className={cn('font-medium text-sm', dark ? 'text-violet-400' : 'text-violet-600')}>{exp.company}</div>
                                <div className={cn('text-xs mb-1', dark ? 'text-slate-500' : 'text-slate-400')}>{exp.duration}</div>
                                <p className={cn('text-sm whitespace-pre-wrap', dark ? 'text-slate-400' : 'text-slate-600')}>{exp.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(index)} className={cn('p-1.5 rounded-lg transition', dark ? 'text-slate-500 hover:text-violet-400 hover:bg-violet-500/10' : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50')} title="Edit">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                </button>
                                <button onClick={() => dispatch(removeExperience(index))} className={cn('p-1.5 rounded-lg transition', dark ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50')} title="Remove">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                         </div>
                    </div>
                ))}
            </div>

            {/* Add New Experience Form or Placeholder */}
            {!showForm ? (
                <div 
                    onClick={() => setShowForm(true)}
                    className={addBox(dark)}
                >
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-2', dark ? 'bg-slate-800' : 'bg-slate-100')}>
                        <svg className={cn('w-6 h-6', dark ? 'text-slate-500' : 'text-slate-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <p className={cn('font-semibold text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>Add Experience</p>
                    <p className={cn('text-xs mt-0.5', dark ? 'text-slate-600' : 'text-slate-400')}>Click to add your work experience</p>
                </div>
            ) : (
                <div className={cardBox(dark)}>
                    <h3 className={cn('text-sm font-bold mb-4', dark ? 'text-white' : 'text-slate-900')}>Add Work Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1"><label className={lbl(dark)}>Role / Job Title</label><input type="text" name="role" value={newExp.role} onChange={handleChange} className={inp(dark)} placeholder="e.g. Senior Developer" autoComplete="off" /></div>
                        <div className="space-y-1"><label className={lbl(dark)}>Company</label><input type="text" name="company" value={newExp.company} onChange={handleChange} className={inp(dark)} placeholder="e.g. Google" autoComplete="off" /></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* From Date */}
                        <div className="space-y-1">
                            <label className={lbl(dark)}>From Date</label>
                            <div className="relative" ref={fromDateRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowFromCalendar(!showFromCalendar)}
                                    className={cn('w-full p-2.5 rounded-lg border outline-none text-left transition-colors flex items-center justify-between', dark ? 'bg-[#131e30] border-slate-700/60 hover:border-violet-500/50 text-white' : 'bg-white border-slate-200 hover:border-violet-400 text-slate-900')}
                                >
                                    <span className={cn(newExp.fromDate ? '' : '', dark ? (newExp.fromDate ? 'text-white' : 'text-slate-500') : (newExp.fromDate ? 'text-slate-900' : 'text-slate-400'))}>
                                        {newExp.fromDate ? formatDate(newExp.fromDate) : 'Select date'}
                                    </span>
                                    <svg className={cn('w-4 h-4', dark ? 'text-slate-500' : 'text-slate-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </button>
                                <CalendarPicker calendarView={fromCalendarView} onDateSelect={(date) => handleDateSelect('fromDate', date)} onMonthChange={(dir) => changeMonth('from', dir)} onYearChange={(year) => setFromCalendarView(prev => ({ ...prev, year }))} show={showFromCalendar} selectedDate={newExp.fromDate} dark={dark} />
                            </div>
                        </div>

                        {/* To Date */}
                        <div className="space-y-1">
                            <label className={lbl(dark)}>To Date</label>
                            <div className="relative" ref={toDateRef}>
                                <button
                                    type="button"
                                    onClick={() => !newExp.isPresent && setShowToCalendar(!showToCalendar)}
                                    disabled={newExp.isPresent}
                                    className={cn('w-full p-2.5 rounded-lg border outline-none text-left transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed', dark ? 'bg-[#131e30] border-slate-700/60 hover:border-violet-500/50 text-white' : 'bg-white border-slate-200 hover:border-violet-400 text-slate-900')}
                                >
                                    <span className={dark ? (newExp.isPresent || newExp.toDate ? 'text-white' : 'text-slate-500') : (newExp.isPresent || newExp.toDate ? 'text-slate-900' : 'text-slate-400')}>
                                        {newExp.isPresent ? 'Present' : (newExp.toDate ? formatDate(newExp.toDate) : 'Select date')}
                                    </span>
                                    <svg className={cn('w-4 h-4', dark ? 'text-slate-500' : 'text-slate-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </button>
                                <CalendarPicker calendarView={toCalendarView} onDateSelect={(date) => handleDateSelect('toDate', date)} onMonthChange={(dir) => changeMonth('to', dir)} onYearChange={(year) => setToCalendarView(prev => ({ ...prev, year }))} show={showToCalendar && !newExp.isPresent} selectedDate={newExp.toDate} dark={dark} />
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => {
                            if (e.target.tagName !== 'INPUT') {
                                setNewExp(prev => ({ ...prev, isPresent: !prev.isPresent, toDate: !prev.isPresent ? null : prev.toDate }));
                            }
                        }}>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="isPresent"
                                    checked={newExp.isPresent}
                                    onChange={handleChange}
                                    className={cn('w-5 h-5 rounded cursor-pointer focus:ring-0 focus:outline-none appearance-none border-2 checked:bg-violet-600 checked:border-violet-600', dark ? 'bg-[#131e30] border-slate-600' : 'bg-white border-slate-400')}
                                />
                                {newExp.isPresent && (
                                    <svg className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className={cn('text-sm font-medium', dark ? 'text-slate-300' : 'text-slate-700')}>I currently work here</span>
                        </label>
                    </div>

                    <div className="mb-4 space-y-1">
                        <label className={lbl(dark)}>Description / Achievements</label>
                        <textarea name="description" value={newExp.description} onChange={handleChange} rows={3} className={cn(inp(dark), 'resize-none')} placeholder="What did you achieve here?" />
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setShowForm(false)} className={cn(btnSecondary(dark), 'flex-1 py-2.5')}>Cancel</button>
                        <button onClick={handleAdd} className={cn(btnPrimary, 'flex-1 py-2.5')}>Save Experience</button>
                    </div>
                </div>
            )}

            <div className="pt-4 flex justify-between">
                <button onClick={() => dispatch(prevStep())} className={btnSecondary(dark)}>â† Back</button>
                <button onClick={() => dispatch(nextStep())} className={btnPrimary}>Next: Projects â†’</button>
            </div>
        </div>
    );
};

export default ExperienceForm;


