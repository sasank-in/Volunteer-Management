# UI Components Integration Guide

## Quick Reference

This guide shows how to use the new corporate-grade UI components in your application.

---

## 1. ErrorBoundary Component

### Purpose
Catches React errors and displays a user-friendly error page instead of crashing.

### Implementation
Already integrated in `App.tsx`, no additional setup needed.

### Example in Custom Components
```tsx
import ErrorBoundary from '@components/ErrorBoundary';

export const MyFeature = () => (
  <ErrorBoundary>
    <ComplexComponent />
  </ErrorBoundary>
);
```

---

## 2. LoadingState Component

### Purpose
Display skeleton loaders while fetching data.

### Variants
- `card` (default) - Grid of card skeletons
- `table` - Table rows
- `avatar` - Avatar placeholders
- `text` - Text lines

### Usage Examples

**Card Variant** (for displaying lists/grids)
```tsx
import LoadingState from '@components/LoadingState';
import { useQuery } from '@tanstack/react-query';

const EventsList = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiService.getAllEvents(),
  });

  if (isLoading) {
    return <LoadingState variant="card" count={6} />;
  }

  return (
    <Grid container spacing={3}>
      {events.map((event) => (
        <Grid item xs={12} sm={6} md={4} key={event.id}>
          {/* Event card */}
        </Grid>
      ))}
    </Grid>
  );
};
```

**Table Variant** (for displaying data tables)
```tsx
const DataTable = () => {
  const { isLoading } = useQuery({...});

  if (isLoading) {
    return <LoadingState variant="table" count={5} />;
  }

  return <TableContent />;
};
```

**Avatar Variant** (for user lists)
```tsx
const UserList = () => {
  const { isLoading } = useQuery({...});

  if (isLoading) {
    return <LoadingState variant="avatar" count={3} />;
  }

  return <Users />;
};
```

---

## 3. EmptyState Component

### Purpose
Display a friendly message when no data is available.

### Variants
- `inbox` (default) - No items
- `search` - No search results
- `folder` - Empty folder

### Usage Examples

**Basic Empty State**
```tsx
import EmptyState from '@components/EmptyState';

const EventsList = () => {
  const { data: events } = useQuery({...});

  if (events.length === 0) {
    return (
      <EmptyState
        title="No events found"
        description="There are no events available right now. Check back soon!"
        variant="inbox"
      />
    );
  }

  return <EventsGrid />;
};
```

**With Action Button**
```tsx
const EventsList = () => {
  const navigate = useNavigate();
  const { data: events } = useQuery({...});

  if (events.length === 0) {
    return (
      <EmptyState
        title="Create your first event"
        description="Start by creating an event to manage volunteers"
        variant="inbox"
        action={{
          label: 'Create Event',
          onClick: () => navigate('/events/create'),
        }}
      />
    );
  }

  return <EventsGrid />;
};
```

**Search Results**
```tsx
const SearchResults = ({ query }) => {
  const { data: results } = useQuery({
    queryKey: ['search', query],
    queryFn: () => apiService.search(query),
  });

  if (results.length === 0) {
    return (
      <EmptyState
        title={`No results for "${query}"`}
        description="Try a different search term or browse all events"
        variant="search"
      />
    );
  }

  return <Results />;
};
```

---

## 4. StatCard Component

### Purpose
Display metrics with trends and visual indicators.

### Properties
```tsx
interface StatCardProps {
  title: string;              // Metric name
  value: string | number;     // The metric value
  subtitle?: string;          // Descriptive text
  icon?: React.ReactNode;     // Icon component
  trend?: 'up' | 'down' | null; // Trend direction
  trendValue?: string;        // Trend percentage/amount
  color?: '...' | ...;        // Color scheme
}
```

### Usage Examples

**Basic Stat Card**
```tsx
import StatCard from '@components/StatCard';
import { Event as EventIcon } from '@mui/icons-material';

const Dashboard = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard
        title="Total Events"
        value={42}
        icon={<EventIcon />}
        color="primary"
      />
    </Grid>
  </Grid>
);
```

**With Trend Indicator**
```tsx
<StatCard
  title="Volunteers This Month"
  value={156}
  icon={<PeopleIcon />}
  color="success"
  trend="up"
  trendValue="+23%"
  subtitle="vs last month"
/>
```

**With Different Colors**
```tsx
// Success/Green
<StatCard
  title="Completed Events"
  value={28}
  color="success"
/>

// Warning/Amber
<StatCard
  title="Pending Approvals"
  value={5}
  color="warning"
/>

// Error/Red
<StatCard
  title="Cancelled"
  value={2}
  color="error"
/>

// Info/Cyan
<StatCard
  title="Active Volunteers"
  value={342}
  color="info"
/>
```

---

## 5. Theme System

### Accessing Theme Colors

**In Components**
```tsx
import { useTheme } from '@mui/material/styles';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ color: theme.palette.primary.main }}>
      // Content
    </Box>
  );
};
```

**Using sx Prop**
```tsx
<Box
  sx={{
    color: 'primary.main',           // #3b82f6 light, #60a5fa dark
    backgroundColor: 'background.paper',
    padding: theme => theme.spacing(2), // 16px
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: 'action.hover',
    },
  }}
>
  // Content
</Box>
```

### Color Palette Reference

**Light Mode**
```
primary.main: #3b82f6
primary.light: #60a5fa
primary.lighter: #dbeafe (backgrounds)
secondary.main: #8b5cf6
success.main: #10b981
warning.main: #f59e0b
error.main: #ef4444
info.main: #06b6d4

background.default: #f8fafc
background.paper: #ffffff
text.primary: #0f172a
text.secondary: #64748b
```

**Dark Mode**
```
primary.main: #60a5fa
primary.light: #93c5fd
secondary.main: #a78bfa
(Same status colors with high contrast)

background.default: #0f172a
background.paper: #1e293b
text.primary: #f1f5f9
text.secondary: #cbd5e1
```

---

## 6. Responsive Layout Example

### Complete Dashboard Page
```tsx
import { Box, Grid, Container, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import MainLayout from '@components/Layout';
import StatCard from '@components/StatCard';
import LoadingState from '@components/LoadingState';
import EmptyState from '@components/EmptyState';
import { useQuery } from '@tanstack/react-query';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiService.getDashboardStats(),
  });

  const { data: recentEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'recent'],
    queryFn: () => apiService.getRecentEvents(),
  });

  return (
    <MainLayout>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/create')}
          >
            New Event
          </Button>
        </Box>

        {/* Stats Section */}
        {statsLoading ? (
          <LoadingState variant="text" count={4} />
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[...].map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.id}>
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Recent Events Section */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Recent Events
        </Typography>
        {eventsLoading ? (
          <LoadingState variant="card" count={3} />
        ) : recentEvents.length === 0 ? (
          <EmptyState
            title="No events yet"
            description="Create an event to invite volunteers"
            variant="inbox"
            action={{
              label: 'Create Event',
              onClick: () => navigate('/events/create'),
            }}
          />
        ) : (
          <Grid container spacing={3}>
            {recentEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                {/* Event card component */}
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
};
```

---

## 7. Form with Loading State Example

```tsx
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import { useState } from 'react';

const CreateEventForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.createEvent(formData);
      // Success handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
      <TextField
        fullWidth
        label="Event Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        margin="normal"
        disabled={loading}
      />
      
      <TextField
        fullWidth
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        margin="normal"
        multiline
        rows={4}
        disabled={loading}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Event'}
      </Button>
    </Box>
  );
};
```

---

## 8. Best Practices

### ✅ DO
- Use LoadingState while fetching data
- Show EmptyState when no data available
- Use StatCard for metrics/KPIs
- Leverage theme colors via sx prop
- Test on mobile (responsive design)
- Use semantic HTML elements
- Provide ARIA labels for accessibility

### ❌ DON'T
- Hardcode colors (use theme instead)
- Skip error boundaries in complex features
- Forget loading states
- Use color alone to convey status (use icons + text)
- Ignore keyboard navigation
- Make touch targets too small (< 44px)

---

## 9. Customization

### Custom Color Stat Card
```tsx
// Add new color to theme first
<StatCard
  color="custom" // Won't work - use predefined colors
/>

// Use predefined colors instead
<StatCard
  color="primary" | "secondary" | "success" | "warning" | "error" | "info"
/>
```

### Custom Theme Colors
Edit `src/theme/index.ts` and update palette colors:
```tsx
palette: {
  primary: {
    main: '#YourColor',
    light: '#LighterColor',
    lighter: '#LightestColor',
  },
  // ... other colors
}
```

---

## 10. Testing Checklist

- [ ] Components render without errors
- [ ] Responsive breakpoints work (xs, sm, md, lg)
- [ ] Theme switching toggles light/dark mode
- [ ] Loading states appear during async operations
- [ ] Empty states show when data is empty
- [ ] Error boundary catches errors
- [ ] Keyboard navigation works
- [ ] Color contrast is sufficient
- [ ] Touch targets are >= 44px
- [ ] No console errors in browser

---

## Support & Resources

- Material-UI Docs: https://mui.com
- Component Files: `src/components/`
- Theme File: `src/theme/index.ts`
- Design Guide: `docs/UI_DESIGN_GUIDE.md`
- Improvements Summary: `docs/UI_IMPROVEMENTS_SUMMARY.md`

---

**Last Updated**: March 3, 2026
