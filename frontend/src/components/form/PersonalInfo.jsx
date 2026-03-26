import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormData, nextStep, checkSlugThunk } from '../../features/portfolioSlice';
import { useFormTheme, cn, inp, lbl, btnPrimary } from './useFormTheme';

const PersonalInfo = () => {
  const dispatch = useDispatch();
  const dark = useFormTheme();
  const { formData, slug, slugStatus } = useSelector((state) => state.portfolio);
  const debounceRef = useRef(null);

  // Debounced slug check — fires 500ms after user stops typing the name
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (formData.name && formData.name.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        dispatch(checkSlugThunk(formData.name));
      }, 500);
    }
    return () => clearTimeout(debounceRef.current);
  }, [formData.name, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.title) {
      dispatch(nextStep());
    } else {
      alert('Please fill in Name and Title');
    }
  };

  // Slug status indicator
  const SlugIndicator = () => {
    if (slugStatus === 'idle' || !slug) return null;
    if (slugStatus === 'checking') {
      return (
        <p className={cn('text-xs mt-1.5', dark ? 'text-slate-400' : 'text-slate-500')}>
          Checking availability…
        </p>
      );
    }
    if (slugStatus === 'available') {
      return (
        <p className='text-xs mt-1.5 text-emerald-500 font-medium'>
          ✓ Available — your portfolio will be at <span className='font-semibold'>/{slug}</span>
        </p>
      );
    }
    if (slugStatus === 'taken') {
      return (
        <p className='text-xs mt-1.5 text-rose-500 font-medium'>
          ✗ <span className='font-semibold'>/{slug}</span> is already taken — a unique suffix will be added
        </p>
      );
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={lbl(dark)}>Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={inp(dark)}
          placeholder="e.g. Jane Doe"
        />
        <SlugIndicator />
      </div>
      <div>
        <label className={lbl(dark)}>Professional Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={inp(dark)}
          placeholder="e.g. Frontend Developer"
        />
      </div>
      <div>
        <label className={lbl(dark)}>About Me</label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          rows={5}
          className={cn(inp(dark), 'resize-none')}
          placeholder="Brief introduction about yourself..."
        />
      </div>
      <div className="pt-4 flex justify-end">
        <button type="submit" className={btnPrimary}>
          Next: Skills →
        </button>
      </div>
    </form>
  );
};

export default PersonalInfo;
