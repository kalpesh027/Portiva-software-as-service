import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addEducation, removeEducation, nextStep, prevStep } from '../../features/portfolioSlice';
import { useFormTheme, cn, inp, lbl, btnPrimary, btnSecondary, cardBox, addBox, itemCard } from './useFormTheme';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

const CalendarPicker = ({ calendarView, onDateSelect, onMonthChange, show, selectedDate, onYearChange, dark }) => {
    const [viewMode, setViewMode] = React.useState('date');
    const calendarRef = React.useRef(null);

    const daysInMonth = getDaysInMonth(calendarView.month, calendarView.year);
    const firstDay = getFirstDayOfMonth(calendarView.month, calendarView.year);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
    const days = [];

    React.useEffect(() => { if (show) setViewMode('date'); }, [show]);

    const handleYearSelect = (year) => { onYearChange(year); setViewMode('month'); };
    const handleMonthSelect = (monthIndex) => { onMonthChange(monthIndex - calendarView.month); setViewMode('date'); };

    for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} className="h-8" />);
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(calendarView.year, calendarView.month, day);
        const isSelected = selectedDate && new Date(selectedDate).toDateString() === date.toDateString();
        days.push(
            <button key={day} type="button" onClick={() => onDateSelect(date.toISOString())}
                className={cn('h-8 rounded-lg text-sm font-medium transition-colors',
                    isSelected
                        ? 'bg-violet-600 text-white'
                        : dark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-violet-50 text-slate-700'
                )}>
                {day}
            </button>
        );
    }

    if (!show) return null;

    const base = dark
        ? 'bg-[#0d1525] border border-slate-700/60 text-white'
        : 'bg-white border border-slate-200 text-slate-900';
    const navBtn = dark ? 'p-1 hover:bg-slate-700 rounded-lg transition-colors text-slate-400' : 'p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-600';
    const headerBtn = dark ? 'font-semibold hover:bg-slate-700 px-3 py-1 rounded-lg transition-colors text-slate-200' : 'font-semibold hover:bg-slate-100 px-3 py-1 rounded-lg transition-colors text-slate-800';
    const weekDay = dark ? 'h-8 flex items-center justify-center text-xs font-medium text-slate-500' : 'h-8 flex items-center justify-center text-xs font-medium text-slate-400';
    const selMonth = 'bg-violet-600 text-white';
    const hoverMonth = dark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700';

    return (
        <div ref={calendarRef} className={cn('absolute z-20 mt-1 backdrop-blur-xl rounded-2xl shadow-2xl p-4 w-72', base)}>
            <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => viewMode === 'date' ? onMonthChange(-1) : onMonthChange(0, -1)} className={navBtn}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex items-center gap-2">
                    {viewMode === 'date' && <button type="button" onClick={() => setViewMode('year')} className={headerBtn}>{monthNamesFull[calendarView.month]} {calendarView.year}</button>}
                    {viewMode === 'month' && <button type="button" onClick={() => setViewMode('year')} className={headerBtn}>{calendarView.year}</button>}
                    {viewMode === 'year' && <div className={cn('px-3 py-1', dark ? 'text-slate-200' : 'text-slate-800')}>Select Year</div>}
                </div>
                <button type="button" onClick={() => viewMode === 'date' ? onMonthChange(1) : onMonthChange(0, 1)} className={navBtn}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {viewMode === 'date' && (
                <>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className={weekDay}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">{days}</div>
                </>
            )}
            {viewMode === 'month' && (
                <div className="grid grid-cols-3 gap-2">
                    {monthNamesFull.map((month, i) => (
                        <button key={month} type="button" onClick={() => handleMonthSelect(i)}
                            className={cn('py-3 rounded-lg text-sm font-medium transition-colors', i === calendarView.month ? selMonth : hoverMonth)}>
                            {month.substring(0, 3)}
                        </button>
                    ))}
                </div>
            )}
            {viewMode === 'year' && (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {years.map(year => (
                        <button key={year} type="button" onClick={() => handleYearSelect(year)}
                            className={cn('py-3 rounded-lg text-sm font-medium transition-colors', year === calendarView.year ? selMonth : hoverMonth)}>
                            {year}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const EducationForm = () => {
    const dispatch = useDispatch();
    const { formData } = useSelector((state) => state.portfolio);
    const dark = useFormTheme();
    const [showForm, setShowForm] = useState(true);
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const startDateRef = React.useRef(null);
    const endDateRef = React.useRef(null);

    const [newEdu, setNewEdu] = useState({ school: '', degree: '', startDate: null, endDate: null, description: '' });
    const [startCalendarView, setStartCalendarView] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
    const [endCalendarView, setEndCalendarView] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    };

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (startDateRef.current && !startDateRef.current.contains(e.target)) setShowStartCalendar(false);
            if (endDateRef.current && !endDateRef.current.contains(e.target)) setShowEndCalendar(false);
        };
        if (showStartCalendar || showEndCalendar) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showStartCalendar, showEndCalendar]);

    const handleChange = (e) => setNewEdu(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleDateSelect = (field, date) => {
        if (field === 'endDate' && newEdu.startDate && date < newEdu.startDate) { alert('End date cannot be before start date'); return; }
        if (field === 'startDate' && newEdu.endDate && date > newEdu.endDate) {
            setNewEdu(prev => ({ ...prev, [field]: date, endDate: null }));
        } else {
            setNewEdu(prev => ({ ...prev, [field]: date }));
        }
        if (field === 'startDate') setShowStartCalendar(false);
        if (field === 'endDate') setShowEndCalendar(false);
    };

    const changeMonth = (calendar, direction, yearOffset = 0) => {
        const setter = calendar === 'start' ? setStartCalendarView : setEndCalendarView;
        setter(prev => {
            let newMonth = yearOffset !== 0 ? prev.month : prev.month + direction;
            let newYear = yearOffset !== 0 ? prev.year + yearOffset : prev.year;
            if (newMonth > 11) { newMonth = 0; newYear++; }
            if (newMonth < 0) { newMonth = 11; newYear--; }
            return { month: newMonth, year: newYear };
        });
    };

    const handleAdd = () => {
        if (newEdu.school && newEdu.degree && newEdu.startDate) {
            const duration = `${formatDate(newEdu.startDate)} - ${newEdu.endDate ? formatDate(newEdu.endDate) : 'Present'}`;
            dispatch(addEducation({ ...newEdu, duration }));
            setNewEdu({ school: '', degree: '', startDate: null, endDate: null, description: '' });
            setShowForm(false);
        } else {
            alert('Please fill in School, Degree, and Start Date at minimum.');
        }
    };

    const handleEdit = (index) => {
        const edu = formData.education[index];
        const startDate = new Date(edu.duration.split(' - ')[0]);
        const endDate = edu.duration.includes('Present') ? null : new Date(edu.duration.split(' - ')[1]);
        setNewEdu({ school: edu.school, degree: edu.degree, startDate, endDate, description: edu.description || '' });
        dispatch(removeEducation(index));
        setShowForm(true);
    };

    const dateBtnClass = cn(
        'w-full p-2.5 rounded-lg border outline-none text-left transition-colors flex items-center justify-between',
        dark ? 'bg-[#131e30] border-slate-700/60 hover:border-violet-500/50 text-white' : 'bg-white border-slate-200 hover:border-violet-400 text-slate-900'
    );

    return (
        <div className={cn("space-y-5", dark ? 'text-white' : 'text-slate-900')}>

            <div className="space-y-3 mb-6">
                {formData.education.map((edu, index) => (
                    <div key={index} className={itemCard(dark, index)}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className={cn('font-bold', dark ? 'text-white' : 'text-slate-900')}>{edu.degree}</h3>
                                <div className={cn('font-medium text-sm', dark ? 'text-violet-400' : 'text-violet-600')}>{edu.school}</div>
                                <div className={cn('text-xs mb-1', dark ? 'text-slate-500' : 'text-slate-400')}>{edu.duration}</div>
                                {edu.description && <p className={cn('text-sm whitespace-pre-wrap', dark ? 'text-slate-400' : 'text-slate-600')}>{edu.description}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(index)} className={cn('p-1.5 rounded-lg transition', dark ? 'text-slate-500 hover:text-violet-400 hover:bg-violet-500/10' : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50')} title="Edit">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                </button>
                                <button onClick={() => dispatch(removeEducation(index))} className={cn('p-1.5 rounded-lg transition', dark ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50')} title="Remove">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!showForm ? (
                <div onClick={() => setShowForm(true)} className={addBox(dark)}>
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-2', dark ? 'bg-slate-800' : 'bg-slate-100')}>
                        <svg className={cn('w-6 h-6', dark ? 'text-slate-500' : 'text-slate-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <p className={cn('font-semibold text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>Add Education</p>
                    <p className={cn('text-xs mt-0.5', dark ? 'text-slate-600' : 'text-slate-400')}>Click to add your education</p>
                </div>
            ) : (
                <div className={cardBox(dark)}>
                    <h3 className={cn('text-sm font-bold mb-4', dark ? 'text-white' : 'text-slate-900')}>Add Education</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                            <label className={lbl(dark)}>School / University</label>
                            <input type="text" name="school" value={newEdu.school} onChange={handleChange} className={inp(dark)} placeholder="e.g. Stanford University" autoComplete="off" />
                        </div>
                        <div className="space-y-1">
                            <label className={lbl(dark)}>Degree</label>
                            <input type="text" name="degree" value={newEdu.degree} onChange={handleChange} className={inp(dark)} placeholder="e.g. BS Computer Science" autoComplete="off" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                            <label className={lbl(dark)}>Start Date</label>
                            <div className="relative" ref={startDateRef}>
                                <button type="button" onClick={() => setShowStartCalendar(!showStartCalendar)} className={dateBtnClass}>
                                    <span className={newEdu.startDate ? (dark ? 'text-white' : 'text-slate-900') : (dark ? 'text-slate-500' : 'text-slate-400')}>
                                        {newEdu.startDate ? formatDate(newEdu.startDate) : 'Select date'}
                                    </span>
                                    <svg className={cn('w-4 h-4', dark ? 'text-slate-500' : 'text-slate-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </button>
                                <CalendarPicker calendarView={startCalendarView} onDateSelect={(d) => handleDateSelect('startDate', d)} onMonthChange={(dir) => changeMonth('start', dir)} onYearChange={(y) => setStartCalendarView(p => ({ ...p, year: y }))} show={showStartCalendar} selectedDate={newEdu.startDate} dark={dark} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className={lbl(dark)}>End Date (Optional)</label>
                            <div className="relative" ref={endDateRef}>
                                <button type="button" onClick={() => setShowEndCalendar(!showEndCalendar)} className={dateBtnClass}>
                                    <span className={newEdu.endDate ? (dark ? 'text-white' : 'text-slate-900') : (dark ? 'text-slate-500' : 'text-slate-400')}>
                                        {newEdu.endDate ? formatDate(newEdu.endDate) : 'Select date or leave for Present'}
                                    </span>
                                    <svg className={cn('w-4 h-4', dark ? 'text-slate-500' : 'text-slate-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </button>
                                <CalendarPicker calendarView={endCalendarView} onDateSelect={(d) => handleDateSelect('endDate', d)} onMonthChange={(dir) => changeMonth('end', dir)} onYearChange={(y) => setEndCalendarView(p => ({ ...p, year: y }))} show={showEndCalendar} selectedDate={newEdu.endDate} dark={dark} />
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 space-y-1">
                        <label className={lbl(dark)}>Description (Optional)</label>
                        <textarea name="description" value={newEdu.description} onChange={handleChange} rows={3} className={cn(inp(dark), 'resize-none')} placeholder="e.g. GPA 3.9, Dean's List, Relevant Coursework..." />
                    </div>

                    <div className="flex gap-2">
                        <button type="button" onClick={() => { setNewEdu({ school: '', degree: '', startDate: null, endDate: null, description: '' }); setShowForm(false); }} className={cn(btnSecondary(dark), 'flex-1 py-2.5')}>Cancel</button>
                        <button type="button" onClick={handleAdd} className={cn(btnPrimary, 'flex-1 py-2.5')}>Save Education</button>
                    </div>
                </div>
            )}

            <div className="pt-6 flex justify-between">
                <button onClick={() => dispatch(prevStep())} className={btnSecondary(dark)}>&#8592; Back</button>
                <button onClick={() => dispatch(nextStep())} className={btnPrimary}>Next: Testimonials &#8594;</button>
            </div>
        </div>
    );
};

export default EducationForm;


