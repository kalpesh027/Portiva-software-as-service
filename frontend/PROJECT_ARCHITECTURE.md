# Project Architecture — Portiva Frontend

## Overview

Portiva is a **portfolio generation SaaS** that lets users create, publish, and manage personal portfolio websites through a guided multi-step form. The frontend is a single-page application (SPA) built with React 19 + Vite, backed by a RESTful API.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19 |
| Build Tool | Vite | 7 |
| State Management | Redux Toolkit | ^2.11.2 |
| Routing | React Router DOM | v7 |
| Styling | Tailwind CSS | v4 |
| Component Library | MUI (Material UI) | ^7.3.8 |
| Animation | Framer Motion | ^12.34.4 |
| Icons | react-icons, @tabler/icons-react | latest |

---

## Folder Structure

```
frontend/
├── public/                     # Static assets served at root
├── src/
│   ├── assets/                 # Images, fonts, static media
│   ├── components/
│   │   ├── common/             # Shared atomic components
│   │   │   ├── Icon.jsx        # SVG icon wrapper
│   │   │   └── LoadingSpinner.jsx
│   │   ├── dashboard/          # Dashboard-specific panels
│   │   │   ├── Analytics.jsx
│   │   │   ├── EditContent.jsx
│   │   │   ├── ManageTemplate.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Subscription.jsx
│   │   ├── form/               # Multi-step form steps
│   │   │   ├── PersonalInfo.jsx
│   │   │   ├── SkillsForm.jsx
│   │   │   ├── ExperienceForm.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── EducationForm.jsx
│   │   │   ├── TestimonialsForm.jsx
│   │   │   ├── ContactForm.jsx
│   │   │   └── useFormTheme.js # Form-scoped theme hook (delegates to useStoredTheme)
│   │   ├── landing/            # Landing page sections
│   │   │   ├── Hero.jsx
│   │   │   ├── FeaturesGrid.jsx
│   │   │   ├── Pricing.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── Workflow.jsx
│   │   │   ├── TrustedBy.jsx
│   │   │   ├── WhatSetsUsApart.jsx
│   │   │   ├── CTABanner.jsx
│   │   │   ├── Integrations.jsx
│   │   │   ├── LandingFooter.jsx
│   │   │   └── landingUtils.jsx # Re-exports: cn, T, I, Icon, FadeUp, Tilt, GradText
│   │   ├── About.jsx
│   │   ├── AIProcessing.jsx    # Animated AI loading screen shown during generation
│   │   ├── Contact.jsx
│   │   ├── Navbar.jsx
│   │   ├── PortfolioForm.jsx
│   │   ├── PortfolioSuccess.jsx
│   │   └── Projects.jsx
│   ├── config/
│   │   └── app.config.js       # App-level constants (name, API URL, theme key, locale)
│   ├── constants/
│   │   ├── routes.js           # ROUTES + AUTH_ROUTES path constants
│   │   └── steps.js            # PORTFOLIO_STEPS array (7 steps) + TOTAL_STEPS
│   ├── data/
│   │   ├── portfolioData.js    # Mock/seed portfolio data
│   │   ├── skillsData.js       # Skill suggestions + gradient color sets
│   │   └── uiGradients.js      # Card gradient presets
│   ├── features/
│   │   ├── auth/
│   │   │   ├── authSlice.js    # Auth Redux slice (canonical)
│   │   │   └── index.js        # Barrel exports
│   │   ├── portfolio/
│   │   │   ├── portfolioSlice.js # Portfolio Redux slice (canonical)
│   │   │   └── index.js        # Barrel exports
│   │   ├── authSlice.js        # Backward-compat re-export shim → features/auth/authSlice
│   │   └── portfolioSlice.js   # Backward-compat re-export shim → features/portfolio/portfolioSlice
│   ├── hooks/
│   │   └── useStoredTheme.js   # Reads portify-theme from localStorage, syncs cross-tab
│   ├── pages/
│   │   ├── Landing.jsx         # Public landing page
│   │   ├── Login.jsx           # Auth: login form
│   │   ├── Register.jsx        # Auth: registration form
│   │   ├── OtpVerify.jsx       # Auth: OTP verification
│   │   ├── CreatePortfolio.jsx # 7-step stepper form
│   │   ├── Dashboard.jsx       # Authenticated user dashboard
│   │   └── Preview.jsx         # Portfolio preview (pending implementation)
│   ├── routes/
│   │   ├── AppRoutes.jsx       # Central route map using ROUTES constants
│   │   └── PrivateRoute.jsx    # Auth guard — redirects unauthenticated users to /login
│   ├── services/
│   │   ├── apiClient.js        # Fetch-based HTTP client (get/post/put/patch/delete)
│   │   ├── authService.js      # Auth API calls (login, register, verifyOtp, me, logout)
│   │   └── portfolioService.js # Portfolio API calls (generate, update, analytics, delete)
│   ├── store/
│   │   └── store.js            # Redux store configuration
│   ├── theme/
│   │   └── ThemeContext.jsx    # React context — provides `dark` boolean, persists to localStorage
│   ├── utils/
│   │   ├── cn.js               # Class name utility: cn(...classes) => string
│   │   ├── icons.js            # SVG path strings (I.sun, I.moon, I.menu, …)
│   │   └── themeTokens.js      # T(dark) — returns Tailwind class token object
│   ├── App.jsx                 # Root component: ThemeProvider + BrowserRouter + AppRoutes
│   ├── index.css               # Tailwind directives + global CSS animations
│   └── main.jsx                # React root: Redux Provider + StrictMode
├── .editorconfig               # Editor formatting rules (indent, EOL, charset)
├── .prettierrc                 # Prettier config (printWidth 100, single quotes, trailing commas)
├── eslint.config.js            # ESLint v9 flat config (react-hooks, react-refresh, no-console)
├── index.html                  # Vite HTML entry point
├── package.json
├── postcss.config.js           # Tailwind v4 PostCSS plugin
├── tailwind.config.js
└── vite.config.js              # Vite config with path aliases (@, @components, @pages, …)
```

---

## State Management

Redux Toolkit manages two global slices:

### `auth` slice (`features/auth/authSlice.js`)
| State Key | Type | Purpose |
|---|---|---|
| `user` | object \| null | Authenticated user profile |
| `token` | string \| null | JWT access token |
| `loading` | boolean | Async operation in-flight |
| `error` | string \| null | Last auth error message |
| `onboarded` | boolean | Whether user completed portfolio creation |

Key actions: `login`, `register`, `logout`, `finishOnboarding`

### `portfolio` slice (`features/portfolio/portfolioSlice.js`)
Tracks the full portfolio creation form state across all 7 steps.

| State Key | Purpose |
|---|---|
| `currentStep` | Active stepper step (1–7) |
| `personalInfo` | Name, headline, bio, avatar |
| `skills` | Array of skill objects |
| `experience` | Array of work experience entries |
| `projects` | Array of project objects |
| `education` | Array of education entries |
| `testimonials` | Array of testimonial entries |
| `contact` | Email, phone, social links |

Key actions: `nextStep`, `prevStep`, `addSkill`, `removeSkill`, `addProject`, `removeProject`, etc.

---

## Theme System

Dark mode is managed through two complementary mechanisms:

1. **`ThemeContext`** (`src/theme/ThemeContext.jsx`) — provides `{ dark, toggleDark }` via React context, persisted to `localStorage` under key `portify-theme`.
2. **`useStoredTheme`** (`src/hooks/useStoredTheme.js`) — direct `localStorage` read (no context dependency) for components that render outside the context tree or need isolation. Synchronizes across browser tabs via the `storage` event.

The `T(dark)` design token factory (`src/utils/themeTokens.js`) returns an object of Tailwind class strings for backgrounds, borders, text, and accent colors — enabling consistent theming without scattered ternary expressions.

---

## API Layer

```
services/
├── apiClient.js          # Base client — attaches Authorization header from localStorage
├── authService.js        # Auth endpoints
└── portfolioService.js   # Portfolio CRUD + analytics endpoints
```

`apiClient.js` wraps `fetch` and provides `get`, `post`, `put`, `patch`, and `delete` methods. Auth tokens are read from `localStorage('portiva-token')`. All errors are normalized to `{ message, status }`.

Base URL is configurable via `VITE_API_URL` environment variable (falls back to `http://localhost:5000/api`).

---

## Routing

| Path | Component | Auth Required |
|---|---|---|
| `/` | `Landing` | No |
| `/login` | `Login` | No |
| `/register` | `Register` | No |
| `/verify-otp` | `OtpVerify` | No |
| `/create` | `CreatePortfolio` | Yes |
| `/dashboard` | `Dashboard` | Yes |
| `/preview` | `Preview` | Yes |
| `/portfolio-dummy` | _(demo)_ | No |

`PrivateRoute` checks `state.auth.token` — if absent, redirects to `/login`.

---

## Path Aliases (Vite)

Configured in `vite.config.js`:

| Alias | Resolves To |
|---|---|
| `@` | `src/` |
| `@components` | `src/components/` |
| `@pages` | `src/pages/` |
| `@hooks` | `src/hooks/` |
| `@utils` | `src/utils/` |
| `@services` | `src/services/` |
| `@store` | `src/store/` |
| `@features` | `src/features/` |
| `@constants` | `src/constants/` |
| `@config` | `src/config/` |

---

## Key Design Decisions

### Duplication Elimination
Before refactoring, several utilities were copy-pasted across files:
- `cn()` — was defined inline in 5+ files → canonical `src/utils/cn.js`
- `useAuthTheme()` — was duplicated in Login, Register, OtpVerify, CreatePortfolio → `src/hooks/useStoredTheme.js`
- `I` icon paths — duplicated in Navbar and landingUtils → `src/utils/icons.js`
- `SvgIcon`/`Icon` component — duplicated in Login and landingUtils → `src/components/common/Icon.jsx`
- `T()` design tokens — defined only in landingUtils but used elsewhere → `src/utils/themeTokens.js`

### Backward Compatibility Shims
`src/features/authSlice.js` and `src/features/portfolioSlice.js` now re-export from their canonical locations (`features/auth/` and `features/portfolio/`). This allows existing imports that haven't been migrated yet to continue working without change.

### Service Layer Separation
All HTTP calls are isolated in `src/services/`. Page and component code never calls `fetch` directly — this makes backend URL changes, auth header changes, and mock/test substitutions trivial.

---

## Monetization Architecture

Portiva is structured as a **freemium SaaS** with the following monetization levers:

### Subscription Tiers
The `Subscription.jsx` dashboard panel and `Pricing.jsx` landing section already implement the UI for tier gating. The `portfolioService.js` includes a `changeTemplate()` method, and the auth slice tracks `onboarded` state, both of which map naturally to feature gating:

| Feature | Free | Pro | Team |
|---|---|---|---|
| Portfolio templates | 1 (basic) | All templates | All + custom |
| AI generation | Limited | Unlimited | Unlimited |
| Custom domain | No | Yes | Yes |
| Analytics | Basic | Advanced | Team analytics |
| Portfolio versions | 1 | Unlimited | Unlimited |
| Remove Portiva branding | No | Yes | Yes |

### Revenue Streams
1. **Monthly/annual subscriptions** — Core recurring revenue; `Subscription.jsx` panel handles plan management
2. **Template marketplace** — Sell premium templates; `ManageTemplate.jsx` is the management UI
3. **White-label licensing** — Agencies pay to remove branding and resell to clients
4. **AI generation credits** — `AIProcessing.jsx` + `portfolioSlice` generation flow can be metered per-generation
5. **Portfolio export/download** — PDF/ZIP export of completed portfolios as a paid feature

### Scaling Considerations
- Redux portfolio slice stores form state client-side; persist to backend per-step for abandoned-cart recovery
- `Analytics.jsx` dashboard panel can show conversion funnel data (step completion rates → upsell trigger points)
- `currentStep` in portfolio state is a natural checkpoint for showing upgrade prompts mid-flow
