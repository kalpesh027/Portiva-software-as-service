import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import PortfolioService from '../../services/portfolioService';

// â”€â”€â”€ Async Thunks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Save draft after each step advance.
 * Dispatched before nextStep() in CreatePortfolio.
 */
export const saveDraftThunk = createAsyncThunk(
  'portfolio/saveDraft',
  async ({ formData, currentStep }, { rejectWithValue }) => {
    try {
      const res = await PortfolioService.saveDraft(formData, currentStep);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to save draft');
    }
  }
);

/**
 * Load existing draft on /create mount.
 * If user already has a portfolio, restores formData + step.
 */
export const loadDraftThunk = createAsyncThunk(
  'portfolio/loadDraft',
  async (_, { rejectWithValue }) => {
    try {
      const res = await PortfolioService.getMyPortfolio();
      return res.data;
    } catch (err) {
      // 404 means no portfolio yet â€” not an error
      if (err?.response?.status === 404) return null;
      return rejectWithValue(err?.response?.data?.message || 'Failed to load draft');
    }
  }
);

/**
 * Check slug availability as user types their name.
 * Debounce is handled in PersonalInfo.jsx.
 */
export const checkSlugThunk = createAsyncThunk(
  'portfolio/checkSlug',
  async (name, { rejectWithValue }) => {
    if (!name || name.trim().length < 2) return { slug: '', available: null };
    try {
      const res = await PortfolioService.checkSlug(name);
      return res.data;
    } catch (err) {
      return rejectWithValue('Slug check failed');
    }
  }
);

// â”€â”€â”€ Initial State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


export const generatePortfolioThunk = createAsyncThunk(
  'portfolio/generate',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await PortfolioService.generate(formData);
      return res;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to start generation');
    }
  }
);

const initialState = {
  currentStep: 1,
  totalSteps: 7,
  formData: {
    name: '',
    title: '',
    about: '',
    skills: [],
    experience: [],
    projects: [],
    education: [],
    testimonials: [],
    blogs: [],
    contact: {
      email: '',
      linkedin: '',
      github: '',
      twitter: '',
    },
  },
  // Draft persistence
  portfolioId: null,       // UUID string from backend after first save-draft
  slug: '',                // current slug preview
  slugStatus: 'idle',      // 'idle' | 'checking' | 'available' | 'taken'
  isSavingDraft: false,    // true while POST /save-draft is in flight
  draftSaveError: null,
  isLoadingDraft: false,
  isGenerating: false,
  isGenerated: false,
  generatedPortfolio: null,
};

export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) state.currentStep += 1;
    },
    prevStep: (state) => {
      if (state.currentStep > 1) state.currentStep -= 1;
    },
    setStep: (state, action) => {
      state.currentStep = action.payload;
    },
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    addBlog: (state, action) => {
      state.formData.blogs.push(action.payload);
    },
    removeBlog: (state, action) => {
      state.formData.blogs = state.formData.blogs.filter((_, i) => i !== action.payload);
    },
    addProject: (state, action) => {
      state.formData.projects.push(action.payload);
    },
    removeProject: (state, action) => {
      state.formData.projects = state.formData.projects.filter((_, i) => i !== action.payload);
    },
    addSkill: (state, action) => {
      if (!state.formData.skills.includes(action.payload)) {
        state.formData.skills.push(action.payload);
      }
    },
    removeSkill: (state, action) => {
      state.formData.skills = state.formData.skills.filter((s) => s !== action.payload);
    },
    addExperience: (state, action) => {
      state.formData.experience.push(action.payload);
    },
    removeExperience: (state, action) => {
      state.formData.experience = state.formData.experience.filter((_, i) => i !== action.payload);
    },
    addEducation: (state, action) => {
      state.formData.education.push(action.payload);
    },
    removeEducation: (state, action) => {
      state.formData.education = state.formData.education.filter((_, i) => i !== action.payload);
    },
    addTestimonial: (state, action) => {
      state.formData.testimonials.push(action.payload);
    },
    removeTestimonial: (state, action) => {
      state.formData.testimonials = state.formData.testimonials.filter((_, i) => i !== action.payload);
    },
    updateContact: (state, action) => {
      state.formData.contact = { ...state.formData.contact, ...action.payload };
    },
    startPortfolioGeneration: (state) => {
      state.isGenerating = true;
    },
    completePortfolio: (state, action) => {
      state.isGenerating = false;
      state.isGenerated = true;
      state.generatedPortfolio = action.payload;
    },
    resetPortfolio: () => initialState,
  },
  extraReducers: (builder) => {
    // â”€â”€ saveDraft â”€â”€
    builder
      .addCase(saveDraftThunk.pending, (state) => {
        state.isSavingDraft = true;
        state.draftSaveError = null;
      })
      .addCase(saveDraftThunk.fulfilled, (state, action) => {
        state.isSavingDraft = false;
        if (action.payload) {
          state.portfolioId = action.payload.portfolioId;
          state.slug = action.payload.slug || state.slug;
        }
      })
      .addCase(saveDraftThunk.rejected, (state, action) => {
        state.isSavingDraft = false;
        state.draftSaveError = action.payload;
      });

    // â”€â”€ loadDraft â”€â”€
    builder
      .addCase(loadDraftThunk.pending, (state) => {
        state.isLoadingDraft = true;
      })
      .addCase(loadDraftThunk.fulfilled, (state, action) => {
        state.isLoadingDraft = false;
        const p = action.payload?.portfolio;
        if (!p) return;
        // Restore portfolioId and slug
        state.portfolioId = p.id;
        state.slug = p.slug || '';
        // Only restore step if still a draft
        if (p.status === 'draft' && p.currentStep > 1) {
          state.currentStep = p.currentStep;
        }
        // Restore formData if available
        if (p.rawFormData) {
          try {
            const saved = typeof p.rawFormData === 'object'
              ? p.rawFormData
              : JSON.parse(p.rawFormData);
            state.formData = { ...state.formData, ...saved };
          } catch (_) {
            // malformed JSON â€” keep default formData
          }
        }
      })
      .addCase(loadDraftThunk.rejected, (state) => {
        state.isLoadingDraft = false;
      });

    // â”€â”€ checkSlug â”€â”€
    builder
      .addCase(checkSlugThunk.pending, (state) => {
        state.slugStatus = 'checking';
      })
      .addCase(checkSlugThunk.fulfilled, (state, action) => {
        const { slug, available } = action.payload || {};
        state.slug = slug || '';
        if (available === null || available === undefined) {
          state.slugStatus = 'idle';
        } else {
          state.slugStatus = available ? 'available' : 'taken';
        }
      })
      .addCase(checkSlugThunk.rejected, (state) => {
        state.slugStatus = 'idle';
      });
  },
});

export const {
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
} = portfolioSlice.actions;

export default portfolioSlice.reducer;

