# Frontend Development Guide

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0+ or yarn 3.0.0+
- Git

### Installation

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Architecture

### Technology Stack
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Material-UI (MUI)** - Professional component library
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **date-fns** - Date utilities

### Folder Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AppBar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── events/
│   │   │   ├── EventsPage.tsx
│   │   │   ├── EventDetailPage.tsx
│   │   │   └── CreateEventPage.tsx
│   │   ├── profile/
│   │   │   └── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/
│   │   └── api.ts
│   ├── store/
│   │   └── index.ts
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── theme/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Development Workflow

### Common Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Creating New Features

#### 1. **Creating a new page:**

```typescript
// src/pages/myfeature/MyFeaturePage.tsx
import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import MainLayout from '@components/Layout';

const MyFeaturePage: React.FC = () => {
  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Typography variant="h4">My Feature</Typography>
      </Container>
    </MainLayout>
  );
};

export default MyFeaturePage;
```

#### 2. **Adding routing:**

In `src/App.tsx`:
```typescript
<Route
  path="/myfeature"
  element={
    <ProtectedRoute>
      <MyFeaturePage />
    </ProtectedRoute>
  }
/>
```

#### 3. **Creating components:**

```typescript
// src/components/MyComponent.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
    </Box>
  );
};

export default MyComponent;
```

#### 4. **Using API services:**

```typescript
import apiService from '@services/api';

// In your component
const { data: events } = useQuery({
  queryKey: ['events'],
  queryFn: () => apiService.getAllEvents(),
});
```

#### 5. **State management with Zustand:**

In `src/store/index.ts`, add your store:
```typescript
interface MyState {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

Use in component:
```typescript
const count = useMyStore((state) => state.count);
const increment = useMyStore((state) => state.increment);
```

## Styling Guide

### Using Material-UI

All components use Material-UI. Leverage the `sx` prop for styling:

```typescript
<Box
  sx={{
    display: 'flex',
    justifyContent: 'center',
    gap: 2,
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 2,
    '&:hover': {
      boxShadow: 6,
    },
  }}
>
  Content
</Box>
```

### Theme Customization

Colors and typography are defined in `src/theme/index.ts`. Modify there for consistent theming.

### Responsive Design

Use MUI Grid and breakpoints:

```typescript
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    Content (full width on mobile, half on tablet, 1/3 on desktop)
  </Grid>
</Grid>
```

## API Integration

### API Service

All API calls go through `src/services/api.ts`. The service handles:
- Request/response interceptors
- Token management
- Error handling
- Base URL configuration

### Making API Calls

```typescript
import apiService from '@services/api';

// Using React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['events'],
  queryFn: () => apiService.getAllEvents(),
});

// Using mutations
const mutation = useMutation({
  mutationFn: (data) => apiService.createEvent(data),
  onSuccess: (result) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
});

mutation.mutate(eventData);
```

### Error Handling

API errors are automatically handled by axios interceptors. For custom handling:

```typescript
.catch((error: AxiosError) => {
  if (error.response?.status === 401) {
    // Handle unauthorized
  } else if (error.response?.status === 404) {
    // Handle not found
  }
});
```

## Authentication

### Login Flow

1. User enters credentials
2. API returns accessToken and refreshToken
3. Tokens stored in localStorage
4. Axios interceptor adds token to requests
5. On 401, token is removed and user redirected to login

### Protected Routes

Use `ProtectedRoute` component to guard pages:

```typescript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Role-Based Access

```typescript
<Route
  path="/events/create"
  element={
    <ProtectedRoute requiredRole="ORGANIZER">
      <CreateEventPage />
    </ProtectedRoute>
  }
/>
```

## Performance Optimization

### Code Splitting

Routes are automatically code-split by Vite. Large components can be lazy-loaded:

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Caching

React Query automatically caches API responses. Configure stale time:

```typescript
const { data } = useQuery({
  queryKey: ['events'],
  queryFn: () => apiService.getAllEvents(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Memoization

Use React.memo for expensive components:

```typescript
const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{data}</div>;
});
```

## Debugging

### Browser DevTools

1. **React DevTools** - Inspect component tree and props/state
2. **Redux DevTools** - Monitor Zustand state changes
3. **Network tab** - Monitor API requests
4. **Console** - View logs and errors

### Vite Development Features

- Hot Module Replacement (HMR) - Instant updates without page reload
- Error overlay - Show build/runtime errors in browser
- Source maps - Debug TypeScript directly

## Testing

### Setting up tests (optional)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Example test

```typescript
// src/components/__tests__/AppBar.test.tsx
import { render, screen } from '@testing-library/react';
import AppBar from '../AppBar';

describe('AppBar', () => {
  it('renders the logo', () => {
    render(<AppBar onMenuClick={() => {}} />);
    expect(screen.getByText('Volunteer Platform')).toBeInTheDocument();
  });
});
```

## Building & Deployment

### Production Build

```bash
npm run build
```

This creates a `dist` folder with optimized files ready for deployment.

### Deployment Platforms

#### Vercel
```bash
npm i -g vercel
vercel deploy
```

#### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

#### Docker
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### Common Issues

**Issue**: API requests failing with CORS error
- **Solution**: Ensure backend is running and proxy is configured in `vite.config.ts`

**Issue**: Token not persisting after page reload
- **Solution**: Check localStorage is enabled and tokens are being saved correctly

**Issue**: Components not updating after state change
- **Solution**: Ensure you're creating new state objects, not mutating existing ones

**Issue**: Types not recognized
- **Solution**: Run `npm install` to ensure all type definitions are installed

## Best Practices

1. **Use meaningful variable names** - Improve code readability
2. **Keep components small** - Easier to test and maintain
3. **Use TypeScript** - Catch errors at compile time
4. **Handle errors gracefully** - Show user-friendly messages
5. **Optimize images** - Use appropriate formats and sizes
6. **Lazy load routes** - Improve initial load time
7. **Test critical paths** - Auth, data submission
8. **Document complex logic** - Help future developers
9. **Use environment variables** - For configuration
10. **Follow MUI best practices** - Use theme tokens, sx prop

## Resources

- [React Documentation](https://react.dev)
- [Material-UI Docs](https://mui.com)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev)

## Support

For questions or issues, check the main project documentation or reach out to the development team.
