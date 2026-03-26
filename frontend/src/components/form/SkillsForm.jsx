import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSkill, removeSkill, nextStep, prevStep } from '../../features/portfolioSlice';
import { skillSuggestions } from '../../data/skillsData';
import { useFormTheme, cn, inp, btnPrimary, btnSecondary } from './useFormTheme';

const SkillsForm = () => {
    const dispatch = useDispatch();
    const dark = useFormTheme();
    const { formData } = useSelector((state) => state.portfolio);
    const [currentSkill, setCurrentSkill] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setCurrentSkill(value);
        if (value.trim()) {
            const filtered = skillSuggestions.filter(skill =>
                skill.toLowerCase().includes(value.toLowerCase()) &&
                !formData.skills.includes(skill)
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleAdd = (skillToAdd = null) => {
        const skill = skillToAdd || currentSkill.trim();
        if (skill && !formData.skills.includes(skill)) {
            dispatch(addSkill(skill));
            setCurrentSkill('');
            setShowSuggestions(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleAdd();
    };

    return (
        <div className="space-y-5">
            {/* Input row */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={currentSkill}
                            onChange={handleInputChange}
                            onFocus={() => currentSkill && setShowSuggestions(filteredSuggestions.length > 0)}
                            placeholder="Search and add skills..."
                            className={inp(dark)}
                        />
                        {/* Suggestions Dropdown */}
                        {showSuggestions && (
                            <div className={cn(
                                'absolute z-10 w-full mt-1 rounded-xl border shadow-xl max-h-56 overflow-hidden',
                                dark
                                    ? 'bg-[#0d1525] border-slate-700/60'
                                    : 'bg-white border-slate-200'
                            )}>
                                <div className="overflow-y-auto max-h-56 py-1" style={{ scrollbarWidth: 'none' }}>
                                    {filteredSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleAdd(suggestion)}
                                            className={cn(
                                                'px-4 py-2 mx-1 my-0.5 rounded-lg cursor-pointer text-sm font-medium transition-all',
                                                dark
                                                    ? 'text-slate-300 hover:bg-violet-500/15 hover:text-violet-300'
                                                    : 'text-slate-700 hover:bg-violet-50 hover:text-violet-700'
                                            )}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all"
                    >
                        Add
                    </button>
                </div>
            </form>

            {/* Skills tag area */}
            <div className={cn(
                'flex flex-wrap gap-2 min-h-[100px] p-4 rounded-xl border',
                dark ? 'bg-[#0d1525]/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'
            )}>
                {formData.skills.map((skill, index) => (
                    <div
                        key={index}
                        className={cn(
                            'px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold border h-7 transition',
                            dark
                                ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                                : 'bg-violet-50 border-violet-200 text-violet-700'
                        )}
                    >
                        <span>{skill}</span>
                        <button
                            onClick={() => dispatch(removeSkill(skill))}
                            type="button"
                            className={cn(
                                'rounded-full w-3.5 h-3.5 flex items-center justify-center text-xs font-bold transition',
                                dark ? 'hover:text-red-400' : 'hover:text-red-500'
                            )}
                        >
                            —
                        </button>
                    </div>
                ))}
                {formData.skills.length === 0 && (
                    <p className={cn('w-full text-center py-4 text-sm', dark ? 'text-slate-600' : 'text-slate-400')}>
                        No skills added yet. Start typing to search and add skills.
                    </p>
                )}
            </div>

            {/* Navigation */}
            <div className="pt-4 flex justify-between">
                <button onClick={() => dispatch(prevStep())} className={btnSecondary(dark)}>
                    ← Back
                </button>
                <button onClick={() => dispatch(nextStep())} className={btnPrimary}>
                    Next: Experience →
                </button>
            </div>
        </div>
    );
};

export default SkillsForm;
