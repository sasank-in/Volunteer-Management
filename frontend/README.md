# Volunteer Management Platform - Frontend

A modern, professional React-based user interface for the Volunteer Management Platform. Built with TypeScript, Material-UI, and TanStack Query for a seamless volunteer experience.

## 🎨 Features

### Professional Corporate Design
- **Clean & Modern UI** - Material Design 3 components
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme** - Users can toggle between themes
- **Professional Color Scheme** - Blue and purple gradient accents

### User Interfaces
- **Authentication** - Login/Register pages with validation
- **Dashboard** - Personalized dashboard for volunteers and organizers
- **Event Browsing** - Search, filter, and discover volunteer opportunities
- **Event Details** - Comprehensive event information with ratings and reviews
- **Event Creation** - Organizers can post new volunteer events
- **User Profile** - Manage personal information and account settings
- **Notifications** - Real-time notification system

### Technical Highlights
- **TypeScript** - Full type safety across the application
- **React Query** - Efficient server state management and caching
- **Zustand** - Lightweight client state management
- **Material-UI (MUI)** - Enterprise-grade component library
- **Responsive Grid** - Mobile-first design approach

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The application will start at `http://localhost:3000` and automatically proxy API requests to `http://localhost:8080`.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AppBar.tsx      # Top navigation bar
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Layout.tsx      # Main layout wrapper
│   └── ProtectedRoute.tsx  # Route protection
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/      # Dashboard pages
│   │   └── DashboardPage.tsx
│   ├── events/         # Event pages
│   │   ├── EventsPage.tsx
│   │   ├── EventDetailPage.tsx
│   │   └── CreateEventPage.tsx
│   ├── profile/        # Profile pages
│   │   └── ProfilePage.tsx
│   └── NotFoundPage.tsx
├── services/           # API services
│   └── api.ts         # Axios-based API client
├── store/              # State management (Zustand)
│   └── index.ts       # Auth and UI stores
├── hooks/              # Custom React hooks
│   └── useAuth.ts     # Authentication hooks
├── types/              # TypeScript type definitions
│   └── index.ts       # All API types
├── utils/              # Utility functions
│   └── helpers.ts     # Date, color, and text utils
├── theme/              # Material-UI theme
│   └── index.ts       # Light and dark themes
├── App.tsx            # Main app component with routing
├── main.tsx           # React entry point
└── index.css          # Global styles
```

## 🔧 Configuration

### API Configuration

The frontend automatically proxies API requests to the backend. To change the API URL, update the `.env` file:

```env
VITE_API_URL=http://localhost:8080/api
```

Or update the proxy configuration in `vite.config.ts`.

### Authentication

The app uses JWT tokens stored in localStorage:
- `accessToken` - Short-lived JWT for API requests (1 hour)
- `refreshToken` - Long-lived token for refreshing access (7 days)

Tokens are automatically included in API requests via the axios interceptor.

## 🎯 Key Components

### Pages

#### LoginPage
- Email/password authentication
- Form validation and error handling
- Password visibility toggle
- Auto-login after registration

#### RegisterPage
- New user registration
- Password confirmation
- Optional phone number
- Input validation
- Auto-login on success

#### DashboardPage
- Personalized greeting
- Statistics cards (events, registrations, ratings)
- Featured/organized events grid
- Quick actions for organizers

#### EventsPage
- Search functionality
- Status filtering (Open, Full, Completed, Cancelled)
- Timeline filtering (All, Upcoming)
- Event cards with progress bars
- Responsive grid layout

#### EventDetailPage
- Full event information
- Volunteer registration/cancellation
- Feedback and rating system
- Organizer participant management
- Event statistics sidebar

#### CreateEventPage
- Event form with validation
- Date/time picker
- Required volunteer counter
- Tips for event creation
- Error handling

#### ProfilePage
- User information display
- Edit profile functionality
- Account type display
- Account settings section
- Privacy and security options

### Components

#### AppBar
- Logo/branding
- Theme toggle
- Notification badge
- User menu (Profile, Settings, Logout)
- Responsive design

#### Sidebar
- Navigation menu
- Collapsible sections
- Active page highlighting
- User role display
- Mobile responsive

#### ProtectedRoute
- Authentication check
- Role-based access control
- Loading state handling
- Redirect to login if unauthorized

## 🎨 Design System

### Colors
- **Primary**: #3b82f6 (Blue)
- **Secondary**: #8b5cf6 (Purple)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)

### Typography
- **Font**: Inter, Roboto (fallback)
- **Headings**: Bold, sans-serif
- **Body**: Regular weight, readable line-height
- **Captions**: Secondary text color

### Spacing
- Based on 8px grid system
- Consistent padding/margins throughout
- Responsive gaps for different breakpoints

## 🔐 Security Features

- **JWT Authentication** - Stateless, secure token-based auth
- **Token Refresh** - Automatic token refresh mechanism
- **Protected Routes** - Route-level authentication checks
- **HTTPS Ready** - Designed for secure deployment
- **Input Validation** - Client-side validation on all forms
- **CORS** - Backend handles CORS configuration

## 📱 Responsive Design

- **Mobile** (< 600px) - Single column, full-width cards
- **Tablet** (600-900px) - Two-column layout
- **Desktop** (> 900px) - Three-column grid layout
- **Sidebar** - Auto-collapse on mobile

## 🚀 Deployment

### Build & Deploy

```bash
# Build the application
npm run build

# Output will be in the `dist` directory
# Deploy /dist to your web server

# Example with Vercel
vercel deploy

# Example with Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 📦 Dependencies

### Core Libraries
- **react** (18.2) - UI framework
- **react-router-dom** (6.16) - Client-side routing
- **typescript** (5.2) - Type safety

### UI & Styling
- **@mui/material** (5.14) - Component library
- **@mui/icons-material** (5.14) - Icon library
- **@emotion/react** & **@emotion/styled** - CSS-in-JS

### State Management
- **zustand** (4.4) - Client state
- **@tanstack/react-query** (5.0) - Server state

### API & Utilities
- **axios** (1.5) - HTTP client
- **date-fns** (2.30) - Date utilities

## 🤝 Contributing

When adding new features:
1. Create components in `src/components/`
2. Create pages in `src/pages/`
3. Add types to `src/types/`
4. Use custom hooks from `src/hooks/`
5. Follow the existing folder structure

## 📄 License

This project is part of the Volunteer Management Platform.

## 📞 Support

For issues or questions, refer to the main project documentation or contact the development team.
