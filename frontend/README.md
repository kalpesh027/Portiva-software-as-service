# Portiva — Frontend

> AI-powered portfolio generation SaaS. Users fill a guided form, AI generates a polished portfolio site — no design skills required.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

The dev server runs at `http://localhost:5173` by default.

---

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend REST API base URL |

---

## Tech Stack

- **React 19** + **Vite 7** — UI framework and build tool
- **Redux Toolkit ^2.11.2** — Global state management
- **React Router DOM v7** — Client-side routing
- **Tailwind CSS v4** — Utility-first styling
- **MUI (Material UI) ^7.3.8** — Dashboard component library
- **Framer Motion ^12.34.4** — Animations

---

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── common/        # Shared atoms: Icon, LoadingSpinner
│   ├── dashboard/     # Dashboard panels
│   ├── form/          # Portfolio form steps (7 steps)
│   └── landing/       # Landing page sections
├── config/            # App-level configuration
├── constants/         # Route paths, stepper steps
├── data/              # Static data (skills, gradients, mock portfolios)
├── features/          # Redux slices
│   ├── auth/          # Auth slice (canonical)
│   └── portfolio/     # Portfolio slice (canonical)
├── hooks/             # Custom React hooks
├── pages/             # Route-level page components
├── routes/            # Route definitions + auth guard
├── services/          # API service layer (apiClient, authService, portfolioService)
├── store/             # Redux store setup
├── theme/             # ThemeContext (dark mode)
└── utils/             # cn, icons (I), themeTokens (T)
```

See [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) for a full architectural breakdown including state shape, API layer, routing table, path aliases, and monetization analysis.

---

## Key Conventions

### Class Names
Use the `cn` utility from `src/utils/cn.js` — not inline ternaries or string concatenation:
```jsx
import { cn } from '../utils/cn';

<div className={cn('base-class', dark && 'dark-class', isActive && 'active-class')} />
```

### Theme
Read dark mode with `useStoredTheme` (no context needed):
```jsx
import { useStoredTheme } from '../hooks/useStoredTheme';

const dark = useStoredTheme();
```

Use design tokens from `src/utils/themeTokens.js` for consistent theming:
```jsx
import { T } from '../utils/themeTokens';

const t = T(dark);
<div className={t.pageBg} />
```

### Icons
All SVG path strings are in `src/utils/icons.js`. Use with the shared `Icon` component:
```jsx
import { I } from '../utils/icons';
import Icon from '../components/common/Icon';

<Icon d={I.dashboard} size={20} />
```

### API Calls
Always go through service files — never call `fetch` directly in components:
```js
import { authService } from '../services/authService';
import { portfolioService } from '../services/portfolioService';

const user = await authService.login({ email, password });
const portfolio = await portfolioService.generate(formData);
```

### Path Aliases
The following aliases are configured in Vite (use them to avoid `../../../` chains):

```js
import { cn } from '@utils/cn';
import Icon from '@components/common/Icon';
import { useStoredTheme } from '@hooks/useStoredTheme';
import { ROUTES } from '@constants/routes';
```

---

## User Flow

```
Register → OTP Verify → CreatePortfolio (7-step stepper) → AI Processing → Dashboard
                                                                               ↑
                           Login ──────────────────────────────────────────────┘
```

1. **Register** — Creates account, sends OTP email
2. **OTP Verify** — Validates email, marks account active
3. **Create Portfolio** — 7-step guided form: Personal Info → Skills → Experience → Projects → Education → Testimonials → Contact
4. **AI Processing** — Backend generates portfolio from form data (`AIProcessing.jsx` shown while waiting)
5. **Dashboard** — View, edit, manage templates, check analytics, manage subscription

---

## Developer Tooling

| Tool | Config File | Purpose |
|---|---|---|
| ESLint | `eslint.config.js` | Linting (react-hooks, react-refresh, no-console, prefer-const) |
| Prettier | `.prettierrc` | Code formatting (100 char width, single quotes, trailing commas) |
| EditorConfig | `.editorconfig` | Editor consistency (indent 2, LF, trim whitespace) |
| Vite | `vite.config.js` | Build + path aliases |

---

## Adding a New Page

1. Create the component in `src/pages/MyPage.jsx`
2. Add the route path to `src/constants/routes.js`
3. Add the `<Route>` entry in `src/routes/AppRoutes.jsx`
4. Wrap with `<PrivateRoute>` if authentication is required

---

## Adding a New API Endpoint

1. Add the method to the appropriate service in `src/services/` (or create a new service file)
2. Use `apiClient` for the HTTP call — it handles auth headers and error normalization automatically

```js
// src/services/myService.js
import { apiClient } from './apiClient';

export const myService = {
  getData: (id) => apiClient.get(`/my-endpoint/${id}`),
  createItem: (body) => apiClient.post('/my-endpoint', body),
};
```

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
