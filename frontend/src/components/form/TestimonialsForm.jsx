import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTestimonial, removeTestimonial, nextStep, prevStep } from '../../features/portfolioSlice';
import { useFormTheme, cn, inp, lbl, btnPrimary, btnSecondary, cardBox, addBox, itemCard } from './useFormTheme';

const TestimonialsForm = () => {
    const dispatch = useDispatch();
    const dark = useFormTheme();
    const { formData } = useSelector((state) => state.portfolio);
    const [showForm, setShowForm] = useState(true);

    const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', company: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTestimonial(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = () => {
        if (newTestimonial.name && newTestimonial.text) {
            dispatch(addTestimonial({ ...newTestimonial }));
            setNewTestimonial({ name: '', role: '', company: '', text: '' });
            setShowForm(false);
        } else {
            alert('Please fill in Name and Testimonial Text.');
        }
    };

    const handleEdit = (index) => {
        const t = formData.testimonials[index];
        setNewTestimonial({ name: t.name, role: t.role || '', company: t.company || '', text: t.text });
        dispatch(removeTestimonial(index));
        setShowForm(true);
    };

    return (
        <div className="space-y-5">
            {/* Existing testimonials */}
            <div className="space-y-3">
                {formData.testimonials.map((item, index) => (
                    <div key={index} className={itemCard(dark, index)}>
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                                <p className={cn('text-sm italic mb-2', dark ? 'text-slate-300' : 'text-slate-600')}>
                                    "{item.text}"
                                </p>
                                <p className={cn('font-bold text-sm', dark ? 'text-white' : 'text-slate-900')}>{item.name}</p>
                                {(item.role || item.company) && (
                                    <p className={cn('text-xs mt-0.5', dark ? 'text-violet-400' : 'text-violet-600')}>
                                        {item.role && item.company ? `${item.role} at ${item.company}` : item.role || item.company}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => handleEdit(index)} className={cn('p-1.5 rounded-lg transition', dark ? 'text-slate-500 hover:text-violet-400 hover:bg-violet-500/10' : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50')}>
                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                </button>
                                <button onClick={() => dispatch(removeTestimonial(index))} className={cn('p-1.5 rounded-lg transition', dark ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50')}>
                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add form or placeholder */}
            {!showForm ? (
                <div onClick={() => setShowForm(true)} className={addBox(dark)}>
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition', dark ? 'bg-slate-800 group-hover:bg-violet-500/15' : 'bg-slate-100 group-hover:bg-violet-100')}>
                        <svg className={cn('w-6 h-6', dark ? 'text-slate-500' : 'text-slate-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <p className={cn('font-semibold text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>Add Testimonial</p>
                    <p className={cn('text-xs mt-0.5', dark ? 'text-slate-600' : 'text-slate-400')}>Click to add a recommendation</p>
                </div>
            ) : (
                <div className={cardBox(dark)}>
                    <p className={cn('text-sm font-bold mb-4', dark ? 'text-white' : 'text-slate-900')}>Add Recommendation</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div><label className={lbl(dark)}>Name</label><input type="text" name="name" value={newTestimonial.name} onChange={handleChange} className={inp(dark)} placeholder="e.g. Alex Johnson" autoComplete="off" /></div>
                        <div><label className={lbl(dark)}>Role / Position</label><input type="text" name="role" value={newTestimonial.role} onChange={handleChange} className={inp(dark)} placeholder="e.g. Project Manager" autoComplete="off" /></div>
                    </div>
                    <div className="mb-4"><label className={lbl(dark)}>Company (Optional)</label><input type="text" name="company" value={newTestimonial.company} onChange={handleChange} className={inp(dark)} placeholder="e.g. Tech Corp" autoComplete="off" /></div>
                    <div className="mb-4"><label className={lbl(dark)}>Recommendation Text</label><textarea name="text" value={newTestimonial.text} onChange={handleChange} rows={3} className={cn(inp(dark), 'resize-none')} placeholder="What did they say about your work?" /></div>
                    <div className="flex gap-2">
                        <button type="button" onClick={handleAdd} className={cn(btnPrimary, 'flex-1 py-2.5 px-4')}>Save Testimonial</button>
                        <button type="button" onClick={() => { setNewTestimonial({ name: '', role: '', company: '', text: '' }); setShowForm(false); }} className={cn(btnSecondary(dark), 'px-5 py-2.5')}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="pt-4 flex justify-between">
                <button onClick={() => dispatch(prevStep())} className={btnSecondary(dark)}>&#8592; Back</button>
                <button onClick={() => dispatch(nextStep())} className={btnPrimary}>Next: Contact &#8594;</button>
            </div>
        </div>
    );
};

export default TestimonialsForm;
