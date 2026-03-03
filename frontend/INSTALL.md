# Frontend Setup & Installation Guide

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### 3. Login
- **Test Volunteer Account:**
  - Email: `volunteer1@example.com`
  - Password: `Volunteer123!`

- **Test Organizer Account:**
  - Email: `organizer1@example.com`
  - Password: `Organizer123!`

## Backend Requirements

Ensure the backend is running on `http://localhost:8080`:

```bash
# From the project root
cd backend
./mvnw clean install
start.bat  # Windows
# or
./mvnw spring-boot:run  # Linux/Mac
```

The frontend will automatically proxy API requests to the backend.

## Build for Production

```bash
npm run build
npm run preview
```

Output will be in the `dist/` directory.

## Project Structure

The frontend includes:
- ✅ Professional Material Design UI
- ✅ Fully responsive layout (mobile/tablet/desktop)
- ✅ Dark/Light theme toggle
- ✅ Authentication pages (Login/Register)
- ✅ Dashboard with statistics
- ✅ Event browsing with search/filter
- ✅ Event details with ratings
- ✅ Event creation for organizers
- ✅ User profile management
- ✅ Protected routes & role-based access
- ✅ Clean component architecture
- ✅ TypeScript for type safety

## Key Features

### Pages Implemented
1. **Login Page** - Secure authentication
2. **Register Page** - New user registration
3. **Dashboard** - Personalized home page
4. **Events Page** - Browse and filter events
5. **Event Details** - Full event information with feedback
6. **Create Event** - Event posting (organizers)
7. **Profile Page** - User settings and information
8. **404 Page** - Error handling

### Components
- AppBar with user menu
- Responsive Sidebar navigation
- Protected route wrapper
- Main layout with theme support

### Services & State
- Axios-based API client with interceptors
- Zustand for state management
- React Query for server state
- Custom authentication hooks

## Technology Stack

- **React 18** - Latest React with hooks
- **TypeScript** - Type-safe development
- **Material-UI 5** - Professional components
- **Vite** - Fast build tool
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Router 6** - Client-side routing
- **Axios** - HTTP client

## Environment Configuration

Create a `.env` file (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:8080/api
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Troubleshooting

### API Requests Failing?
- ✅ Backend must be running on port 8080
- ✅ Check network tab in browser DevTools
- ✅ Verify `.env` has correct API URL

### Can't Sign In?
- ✅ Backend must be fully started
- ✅ Databases must be created
- ✅ Check backend logs for errors

### Port 3000 Already in Use?
```bash
# Change port in vite.config.ts or
npm run dev -- --port 3001
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start backend on port 8080
3. ✅ Run frontend: `npm run dev`
4. ✅ Open `http://localhost:3000`
5. ✅ Test with sample accounts

## Documentation

- **README.md** - Complete frontend documentation
- **DEVELOPMENT.md** - Development workflow guide
- **src/types/index.ts** - TypeScript type definitions
- **src/services/api.ts** - API client documentation

## Features by User Role

### Volunteer
- Browse events
- Register for events
- View participation history
- Submit feedback & ratings
- View profile

### Organizer
- Create events
- Manage events
- View volunteers
- Mark attendance
- Receive feedback

### Admin
- Access all features
- User management
- System administration

## Performance

- **Lazy loading** - Code splitting for faster loads
- **Caching** - React Query optimizes API calls
- **Responsive images** - Adaptive loading
- **Dark mode** - Reduce eye strain
- **PWA ready** - Can be installed as app

## Support

For issues:
1. Check DEVELOPMENT.md for troubleshooting
2. Review browser console for errors
3. Check network tab for API issues
4. Verify backend is running

Enjoy building with your new React frontend! 🚀
