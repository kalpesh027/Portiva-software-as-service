import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addProject, removeProject, nextStep, prevStep } from '../../features/portfolioSlice';
import { useFormTheme, cn, inp, lbl, btnPrimary, btnSecondary, cardBox, addBox, itemCard } from './useFormTheme';

const techSuggestions = [
    'JavaScript','Python','Java','C++','C#','PHP','Ruby','Go','Swift','Kotlin',
    'React','Angular','Vue.js','Node.js','Express.js','Django','Flask','Spring Boot',
    'HTML','CSS','Tailwind CSS','Bootstrap','Sass','TypeScript','Next.js','Nuxt.js',
    'MongoDB','MySQL','PostgreSQL','Redis','Firebase','SQL','SQLite','Oracle',
    'AWS','Azure','Google Cloud','Docker','Kubernetes','Git','CI/CD','Jenkins',
    'GraphQL','REST API','WebSocket','Redux','Zustand','TensorFlow','PyTorch',
    'Figma','Adobe XD','Photoshop','Illustrator','Sketch',
];

const ProjectForm = () => {
    const dispatch = useDispatch();
    const dark = useFormTheme();
    const { formData } = useSelector((state) => state.portfolio);
    const [showForm, setShowForm] = useState(true);
    const [showTechSuggestions, setShowTechSuggestions] = useState(false);
    const [filteredTechSuggestions, setFilteredTechSuggestions] = useState([]);
    const [currentTech, setCurrentTech] = useState('');
    const [newProject, setNewProject] = useState({ title: '', description: '', technologies: [], projectUrl: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewProject(prev => ({ ...prev, [name]: value }));
    };

    const handleTechInputChange = (e) => {
        const value = e.target.value;
        setCurrentTech(value);
        if (value.trim()) {
            const filtered = techSuggestions.filter(t =>
                t.toLowerCase().includes(value.toLowerCase()) && !newProject.technologies.includes(t)
            );
            setFilteredTechSuggestions(filtered);
            setShowTechSuggestions(filtered.length > 0);
        } else {
            setShowTechSuggestions(false);
        }
    };

    const handleAddTech = (tech) => {
        if (tech && !newProject.technologies.includes(tech)) {
            setNewProject(prev => ({ ...prev, technologies: [...prev.technologies, tech] }));
            setCurrentTech('');
            setShowTechSuggestions(false);
        }
    };

    const handleRemoveTech = (techToRemove) => {
        setNewProject(prev => ({ ...prev, technologies: prev.technologies.filter(t => t !== techToRemove) }));
    };

    const handleAdd = () => {
        if (newProject.title && newProject.description) {
            dispatch(addProject({ ...newProject }));
            setNewProject({ title: '', description: '', technologies: [], projectUrl: '' });
            setShowForm(false);
        } else {
            alert('Please fill in Title and Description.');
        }
    };

    const handleEdit = (index) => {
        const proj = formData.projects[index];
        setNewProject({ title: proj.title, description: proj.description || '', technologies: Array.isArray(proj.technologies) ? proj.technologies : [], projectUrl: proj.projectUrl || '' });
        dispatch(removeProject(index));
        setShowForm(true);
    };

    return (
        <div className="space-y-5">
            {/* Existing projects */}
            <div className="space-y-3">
                {formData.projects.map((proj, index) => (
                    <div key={index} className={itemCard(dark, index)}>
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <h3 className={cn('font-bold', dark ? 'text-white' : 'text-slate-900')}>{proj.title}</h3>
                                <p className={cn('text-sm mt-1 whitespace-pre-wrap', dark ? 'text-slate-400' : 'text-slate-600')}>{proj.description}</p>
                                {proj.technologies?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {proj.technologies.map((tech, i) => (
                                            <span key={i} className={cn('px-2 py-0.5 rounded text-xs font-medium border', dark ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-700')}>{tech}</span>
                                        ))}
                                    </div>
                                )}
                                {proj.projectUrl && (
                                    <a href={proj.projectUrl} target="_blank" rel="noopener noreferrer" className={cn('text-xs mt-1.5 inline-block', dark ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-500')}>View Project</a>
                                )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => handleEdit(index)} className={cn('p-1.5 rounded-lg transition', dark ? 'text-slate-500 hover:text-violet-400 hover:bg-violet-500/10' : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50')}>
                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                </button>
                                <button onClick={() => dispatch(removeProject(index))} className={cn('p-1.5 rounded-lg transition', dark ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50')}>
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
                    <p className={cn('font-semibold text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>Add Project</p>
                    <p className={cn('text-xs mt-0.5', dark ? 'text-slate-600' : 'text-slate-400')}>Click to add a project</p>
                </div>
            ) : (
                <div className={cardBox(dark)}>
                    <p className={cn('text-sm font-bold mb-4', dark ? 'text-white' : 'text-slate-900')}>Add Project</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div><label className={lbl(dark)}>Project Title</label><input type="text" name="title" value={newProject.title} onChange={handleChange} className={inp(dark)} placeholder="e.g. E-commerce Platform" autoComplete="off" /></div>
                        <div><label className={lbl(dark)}>Project URL (Optional)</label><input type="text" name="projectUrl" value={newProject.projectUrl} onChange={handleChange} className={inp(dark)} placeholder="https://..." autoComplete="off" /></div>
                    </div>

                    {/* Technologies input */}
                    <div className="mb-4 relative">
                        <label className={lbl(dark)}>Technologies Used</label>
                        <div className={cn('flex flex-wrap gap-1.5 p-2 rounded-xl border min-h-[44px]', dark ? 'bg-[#131e30] border-slate-700/60' : 'bg-white border-slate-200')}>
                            {newProject.technologies.map((tech, i) => (
                                <span key={i} className={cn('flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border', dark ? 'bg-violet-500/15 border-violet-500/40 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-700')}>
                                    {tech}
                                    <button type="button" onClick={() => handleRemoveTech(tech)} className="ml-0.5 hover:text-red-400 transition">—</button>
                                </span>
                            ))}
                            <input type="text" value={currentTech} onChange={handleTechInputChange} onFocus={handleTechInputChange} className={cn('flex-1 min-w-[120px] bg-transparent outline-none text-sm', dark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400')} placeholder={newProject.technologies.length === 0 ? 'Search technologies...' : ''} autoComplete="off" />
                        </div>
                        {showTechSuggestions && (
                            <div className={cn('absolute z-10 w-full mt-1 rounded-xl border shadow-xl max-h-52 overflow-hidden', dark ? 'bg-[#0d1525] border-slate-700/60' : 'bg-white border-slate-200')}>
                                <div className="overflow-y-auto max-h-52 py-1" style={{ scrollbarWidth: 'none' }}>
                                    {filteredTechSuggestions.map((tech, i) => (
                                        <div key={i} onClick={() => handleAddTech(tech)} className={cn('px-4 py-2 mx-1 my-0.5 rounded-lg cursor-pointer text-sm font-medium transition', dark ? 'text-slate-300 hover:bg-violet-500/15 hover:text-violet-300' : 'text-slate-700 hover:bg-violet-50 hover:text-violet-700')}>{tech}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className={lbl(dark)}>Description</label>
                        <textarea name="description" value={newProject.description} onChange={handleChange} rows={3} className={cn(inp(dark), 'resize-none')} placeholder="What did you build and what was your role?" />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={handleAdd} className={cn(btnPrimary, 'flex-1 py-2.5 px-4')}>Save Project</button>
                        <button type="button" onClick={() => { setNewProject({ title: '', description: '', technologies: [], projectUrl: '' }); setShowForm(false); }} className={cn(btnSecondary(dark), 'px-5 py-2.5')}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="pt-4 flex justify-between">
                <button onClick={() => dispatch(prevStep())} className={btnSecondary(dark)}>← Back</button>
                <button onClick={() => dispatch(nextStep())} className={btnPrimary}>Next: Education →</button>
            </div>
        </div>
    );
};

export default ProjectForm;
