import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateContact, prevStep, startPortfolioGeneration, generatePortfolioThunk } from '../../features/portfolio/portfolioSlice';
import { useNavigate } from 'react-router-dom';
import { useFormTheme, cn, inp, lbl, btnPrimary, btnSecondary } from './useFormTheme';

const SOCIAL_FIELDS = [
  { name: 'linkedin', placeholder: 'linkedin.com/in/...', label: 'LinkedIn URL', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
  { name: 'github',   placeholder: 'github.com/...',      label: 'GitHub URL',   icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22' },
  { name: 'twitter',  placeholder: 'twitter.com/...',     label: 'Twitter / X',  icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
  { name: 'website',  placeholder: 'yoursite.com',        label: 'Personal Website', icon: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0c2.76 0 5 4.48 5 10s-2.24 10-5 10-5-4.48-5-10S9.24 2 12 2zM2 12h20' },
];

const ContactForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dark = useFormTheme();
  const { formData } = useSelector((state) => state.portfolio);
  const { user } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email && !formData.contact.email) {
      dispatch(updateContact({ email: user.email }));
    }
  }, [user, formData.contact.email, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateContact({ [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Dispatch real backend generator
    dispatch(generatePortfolioThunk(formData));
    navigate('/ai-processing');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email â€” disabled */}
      <div>
        <label className={lbl(dark)}>Email (from your account)</label>
        <input
          type="email"
          name="email"
          value={formData.contact.email}
          onChange={handleChange}
          disabled
          className={cn(
            inp(dark),
            'cursor-not-allowed opacity-60'
          )}
          placeholder="you@example.com"
        />
      </div>

      {/* Social fields */}
      {SOCIAL_FIELDS.map(({ name, placeholder, label, icon }) => (
        <div key={name}>
          <label className={lbl(dark)}>{label}</label>
          <div className="relative">
            <span className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2',
              dark ? 'text-slate-500' : 'text-slate-400'
            )}>
              <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d={icon} />
              </svg>
            </span>
            <input
              type="text"
              name={name}
              value={formData.contact[name] || ''}
              onChange={handleChange}
              className={cn(inp(dark), 'pl-9')}
              placeholder={placeholder}
            />
          </div>
        </div>
      ))}

      <div className="pt-4 flex justify-between">
        <button type="button" onClick={() => dispatch(prevStep())} className={btnSecondary(dark)}>
          &#8592; Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(btnPrimary, isSubmitting && 'opacity-70 cursor-not-allowed')}
        >
          {isSubmitting ? 'Generating...' : 'Complete Portfolio'}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
