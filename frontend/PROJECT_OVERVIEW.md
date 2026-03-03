# Frontend Project Overview

## 📊 Project Summary

A **Professional Corporate React UI** for the Volunteer Management Platform featuring:
- 🎨 Material Design 3 components
- 📱 Fully responsive design
- 🌓 Dark/Light theme support
- 🔐 JWT authentication with role-based access
- ⚡ Optimized performance with caching
- 🎯 Type-safe with TypeScript
- 🚀 Modern architecture with Vite

---

## 📁 Complete File Structure

### Configuration Files
```
frontend/
├── package.json              # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # TypeScript config for Node
├── vite.config.ts           # Vite bundler configuration
├── .eslintrc.cjs            # ESLint rules
├── .gitignore               # Git ignore patterns
├── .env.example             # Environment variables template
├── index.html               # HTML entry point
├── INSTALL.md               # Quick start guide
├── DEVELOPMENT.md           # Development workflow guide
└── README.md                # Complete documentation
```

### Source Files Structure
```
src/
├── main.tsx                 # React entry point
├── App.tsx                  # Main App component with routing
├── index.css                # Global styles & animations
│
├── components/              # Reusable UI components
│   ├── AppBar.tsx          # Top navigation bar with user menu
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── Layout.tsx          # Main layout wrapper
│   └── ProtectedRoute.tsx  # Route protection component
│
├── pages/                   # Page components (routes)
│   ├── auth/
│   │   ├── LoginPage.tsx                # User login
│   │   └── RegisterPage.tsx             # User registration
│   ├── dashboard/
│   │   └── DashboardPage.tsx            # Home/dashboard
│   ├── events/
│   │   ├── EventsPage.tsx               # Event listing & browsing
│   │   ├── EventDetailPage.tsx          # Event details & feedback
│   │   └── CreateEventPage.tsx          # Create new event
│   ├── profile/
│   │   └── ProfilePage.tsx              # User profile management
│   └── NotFoundPage.tsx                 # 404 error page
│
├── services/                # API & external services
│   └── api.ts              # Axios API client with interceptors
│
├── store/                   # State management (Zustand)
│   └── index.ts            # Auth & UI stores
│
├── hooks/                   # Custom React hooks
│   └── useAuth.ts          # Authentication hooks
│
├── types/                   # TypeScript type definitions
│   └── index.ts            # All API & entity types
│
├── utils/                   # Utility functions
│   └── helpers.ts          # Date, color, text utilities
│
└── theme/                   # Material-UI theme
    └── index.ts            # Light & dark theme definitions
```

---

## 🔑 Key Files Overview

### Authentication & Routing

#### `src/App.tsx`
- Main application component
- Route definitions
- Theme provider setup
- Query client configuration

#### `src/components/ProtectedRoute.tsx`
- Route authentication guard
- Role-based access control
- Loading state handling

#### `src/hooks/useAuth.ts`
- `useAuth()` - Auth state and login/logout
- `useProfile()` - Fetch user profile
- `useRequireAuth()` - Redirect if not authenticated
- `useRequireRole()` - Restrict access by role

### State Management

#### `src/store/index.ts`
- `useAuthStore` - Authentication state
- `useUIStore` - UI state (sidebar, notifications, theme)

### API Integration

#### `src/services/api.ts`
- Axios instance with base configuration
- Request/response interceptors
- Token management (access & refresh)
- All API endpoints:
  - Authentication (login, register, refresh, logout)
  - Users (profile, list, update)
  - Events (create, list, get, update, delete)
  - Participations (register, cancel, history)
  - Feedback (submit, list, ratings)
  - Notifications (list, mark read)

### Types

#### `src/types/index.ts`
- `UserAccount` - User information
- `Event` - Event data
- `Participation` - Volunteer registration
- `Feedback` - Event ratings/reviews
- `Notification` - System notifications
- Request/Response DTOs

### Utilities

#### `src/utils/helpers.ts`
- `formatDate()` - Date formatting
- `formatDateTime()` - Date & time formatting
- `formatDateRelative()` - Relative dates
- `getRatingColor()` - Rating color mapping
- `getEventStatusColor()` - Event status colors
- `calculateProgressPercentage()` - Progress bar calc

### Theming

#### `src/theme/index.ts`
- `lightTheme` - Light mode colors & typography
- `darkTheme` - Dark mode colors & typography
- Component customizations (Button, Card, TextField, etc.)

---

## 🎯 Page Features

### 🔐 Auth Pages

**LoginPage** (`src/pages/auth/LoginPage.tsx`)
- Email/password input with validation
- Password visibility toggle
- Error messages
- Forgot password link
- Auto-redirect if already logged in

**RegisterPage** (`src/pages/auth/RegisterPage.tsx`)
- Username, email, password fields
- Optional phone number
- Password confirmation
- Form validation
- Auto-login after registration

### 🏠 Dashboard

**DashboardPage** (`src/pages/dashboard/DashboardPage.tsx`)
- Welcome message with user name
- Statistics cards (events, registrations, ratings)
- Featured/organized events grid
- CTA for browsing events
- Role-specific content

### 📋 Events

**EventsPage** (`src/pages/events/EventsPage.tsx`)
- Event search
- Filter by status (Open, Full, Completed, Cancelled)
- Filter by timeline (All, Upcoming)
- Event cards with progress bar
- Responsive grid layout
- Event count display

**EventDetailPage** (`src/pages/events/EventDetailPage.tsx`)
- Full event information
- Volunteer registration/cancellation
- Event statistics sidebar
- Feedback & ratings section
- Organizer controls
- Feedback submission form

**CreateEventPage** (`src/pages/events/CreateEventPage.tsx`)
- Event form with validation
- Date/time picker
- Required volunteers input
- Tips section
- Success/error handling

### 👤 Profile

**ProfilePage** (`src/pages/profile/ProfilePage.tsx`)
- Avatar display
- User information (username, email, phone)
- Edit profile functionality
- Account type display
- Settings sections
- Timestamps (joined, updated)

### ❌ Error Handling

**NotFoundPage** (`src/pages/NotFoundPage.tsx`)
- 404 error display
- Back to home button
- Browse events button

---

## 🎨 UI Components

### AppBar (`src/components/AppBar.tsx`)
- **Features:**
  - Logo/branding
  - Theme toggle (light/dark)
  - Notification badge
  - User avatar menu
  - User profile, settings, logout
- **Responsive:** Yes

### Sidebar (`src/components/Sidebar.tsx`)
- **Features:**
  - Navigation menu
  - Expandable sections
  - Active page highlighting
  - User role display
  - Mobile responsive
- **Responsive:** Yes (auto-collapse)

### Layout (`src/components/Layout.tsx`)
- **Features:**
  - Wraps AppBar + Sidebar + Content
  - Sidebar toggle
  - Main content area
- **Used by:** All protected pages

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)
- **Features:**
  - Authentication check
  - Role-based filtering
  - Loading state
  - Redirect to login
- **Usage:** Protect all pages except auth

---

## 📊 Styling Architecture

### Color Palette
```
Primary:    #3b82f6 (Blue)
Secondary:  #8b5cf6 (Purple)
Success:    #10b981 (Green)
Warning:    #f59e0b (Amber)
Error:      #ef4444 (Red)
```

### Typography
```
Font Family: Inter, Roboto
Heading:     Bold weight
Body:        Regular, readable line-height
Caption:     Secondary text color
```

### Spacing System
```
Base unit:   8px
Gap:         Consistent spacing
Padding:     Card/Component internal
Margin:      Component external
```

---

## 🔄 Data Flow

### Authentication Flow
```
1. User enters credentials
   ↓
2. LoginPage calls apiService.login()
   ↓
3. Backend returns tokens + user
   ↓
4. Tokens stored in localStorage
   ↓
5. useAuthStore updates
   ↓
6. Redirect to dashboard
```

### API Request Flow
```
1. Component calls useQuery/useMutation
   ↓
2. Query calls apiService.method()
   ↓
3. Axios interceptor adds token
   ↓
4. Request sent to backend
   ↓
5. Response processed
   ↓
6. React Query caches result
   ↓
7. Component updates with data
```

### State Management Flow
```
1. User action (login, theme toggle)
   ↓
2. Store action dispatched
   ↓
3. Zustand updates state
   ↓
4. Components using store re-render
   ↓
5. UI reflects new state
```

---

## 🚀 Performance Features

- **Code Splitting** - Vite auto-splits routes
- **Lazy Loading** - Components load on demand
- **Caching** - React Query optimizes API calls
- **Memoization** - Components skip unnecessary renders
- **Image Optimization** - Responsive images
- **CSS-in-JS** - Emotion for optimized styles

---

## 🔐 Security Features

- **JWT Authentication** - Tokens in localStorage
- **Token Refresh** - Automatic token rotation
- **Protected Routes** - Authentication guards
- **HTTPS Ready** - Designed for secure deployment
- **Input Validation** - Client-side validation
- **XSS Protection** - React escapes by default
- **CORS** - Backend handles origin validation

---

## 📱 Responsive Breakpoints

```
Mobile:    < 600px  (Single column)
Tablet:    600-900px (Two columns)
Desktop:   > 900px  (Three columns)
```

---

## 🛠️ Build & Deployment

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
# Output: dist/
npm run preview
```

### Deployment Targets
- Vercel
- Netlify
- Docker
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete feature documentation |
| `INSTALL.md` | Quick start guide |
| `DEVELOPMENT.md` | Development workflow & best practices |
| `package.json` | Dependencies documentation |
| Comments in code | Inline documentation |

---

## 🔗 Integration Points

### Backend API
- Base URL: `http://localhost:8080/api`
- Proxy configured in `vite.config.ts`
- Automatically included in all requests

### External Libraries
- Material-UI components
- React Router navigation
- Axios HTTP client
- React Query state
- Zustand stores
- date-fns utilities

---

## 📈 Potential Enhancements

1. **Notifications** - Real-time notification system
2. **Image Upload** - Event photos & avatars
3. **Search** - Full-text search
4. **Maps** - Location display
5. **Analytics** - User behavior tracking
6. **Export** - PDF/CSV exports
7. **Mobile App** - React Native version
8. **Offline Support** - Service workers
9. **Internationalization** - Multi-language
10. **Accessibility** - WCAG compliance

---

## ✅ Quality Checklist

- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Material Design compliance
- ✅ Mobile responsive
- ✅ Accessibility ready (ARIA labels)
- ✅ Error handling throughout
- ✅ Loading states shown
- ✅ Form validation
- ✅ Authentication working
- ✅ API integration complete

---

## 🎓 Learning Resources

- React: https://react.dev
- Material-UI: https://mui.com
- TypeScript: https://www.typescriptlang.org
- Vite: https://vitejs.dev
- React Query: https://tanstack.com/query
- Zustand: https://github.com/pmndrs/zustand

---

## 🤝 Contributing

1. Follow TypeScript conventions
2. Use MUI components
3. Implement responsive design
4. Add proper error handling
5. Document complex logic
6. Test thoroughly
7. Update types in `src/types/index.ts`

---

## 📞 Support

Refer to DEVELOPMENT.md for detailed troubleshooting and workflows.

---

**Frontend Version:** 0.1.0  
**Last Updated:** March 2026  
**Status:** ✅ Production Ready
