/**
 * Barrel export for the portfolio feature.
 */
export {
  nextStep,
  prevStep,
  setStep,
  updateFormData,
  addProject,
  removeProject,
  addSkill,
  removeSkill,
  addExperience,
  removeExperience,
  addEducation,
  removeEducation,
  addTestimonial,
  removeTestimonial,
  updateContact,
  startPortfolioGeneration,
  completePortfolio,
  resetPortfolio,
  addBlog,
  removeBlog,
  saveDraftThunk,
  loadDraftThunk,
  checkSlugThunk,
} from './portfolioSlice';

export { default } from './portfolioSlice';
