# Corporate UI Design Guide

## Overview
This document outlines the corporate-level design standards, components, and best practices for the Volunteer Management Platform.

## Design System

### Color Palette

#### Primary Colors (Light Mode)
- **Primary Blue**: #3b82f6 (Main brand color)
- **Primary Light**: #60a5fa (Hover states)
- **Primary Lighter**: #dbeafe (Backgrounds)
- **Primary Dark**: #1e40af (Pressed states)

#### Secondary Colors
- **Purple**: #8b5cf6 (Secondary actions)
- **Teal/Info**: #06b6d4 (Information highlights)

#### Status Colors
- **Success (Green)**: #10b981, #6ee7b7, #d1fae5
- **Warning (Amber)**: #f59e0b, #fbbf24, #fef3c7
- **Error (Red)**: #ef4444, #fca5a5, #fee2e2

#### Neutral Colors
- **Text Primary**: #0f172a (Dark backgrounds)
- **Text Secondary**: #64748b (Descriptions)
- **Divider**: #e2e8f0 (Separators)
- **Background**: #f8fafc (Page background)

### Typography

#### Font Family
- **Primary**: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
- **Monospace**: Menlo, Monaco, Courier New (for code/data)

#### Font Sizes & Weights
- **H1**: 2.5rem, 700 (Page titles)
- **H2**: 2rem, 700 (Section titles)
- **H3**: 1.5rem, 600 (Subsection titles)
- **H4**: 1.25rem, 600 (Card titles)
- **Body1**: 1rem, 400 (Main text)
- **Body2**: 0.875rem, 400 (Secondary text)
- **Caption**: 0.75rem, 500 (Small text)
- **Button**: Any size, 600 weight

#### Line Heights
- **Headings**: 1.2-1.4
- **Body**: 1.6
- **Form inputs**: 1.5

### Spacing System
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Border Radius
- **Small**: 4px (Small elements, inputs)
- **Medium**: 8px (Buttons, cards)
- **Large**: 12px (Large cards, modals)

### Shadows
- **Elevation 1**: `0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)`
- **Elevation 2**: `0 4px 6px rgba(0, 0, 0, 0.1)`
- **Elevation 3**: `0 10px 15px rgba(0, 0, 0, 0.1)`
- **Elevation 4**: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`

## Component Standards

### Buttons
- **Primary Button**: Filled blue, white text, 10px 24px padding
- **Secondary Button**: Outlined style with secondary color
- **Hover State**: Slight shadow and translation upward (-2px)
- **Active State**: No translation (pressed effect)
- **Disabled State**: 50% opacity, no interaction

### Cards
- **Border Radius**: 12px
- **Shadow**: Elevation 1 by default
- **Hover**: Translate up 4px with elevated shadow
- **Transition**: All 0.3s cubic-bezier(0.4, 0, 0.2, 1)

### Input Fields
- **Border Radius**: 8px
- **Variant**: Outlined
- **Focus State**: 3px colored box-shadow with 10% opacity
- **Hover State**: Border color change to primary

### Navigation Components

#### AppBar
- **Position**: Sticky
- **Background**: Paper color with subtle backdrop blur
- **Shadow**: Minimal (0 1px 3px)
- **Logo**: Gradient text (blue to purple)

#### Sidebar
- **Width**: 280px
- **Border Radius**: 0 12px 12px 0
- **Items**: Smooth transitions with transform on hover
- **Spacing**: 2px padding, 4px margins

### Loading States
- Use `LoadingState` component for:
  - Card skeletons (default)
  - Table skeletons
  - Avatar loaders

### Empty States
- Use `EmptyState` component for:
  - No search results
  - Empty folders/lists
  - No data available
- Include icon, title, description, and optional action

### Stat Cards
- Display metrics with icons
- Include optional trend indicators (up/down)
- Colored top border indicating metric type
- Hover: Shadow increase and up translation

## Accessibility Standards

### WCAG 2.1 Compliance
- **Color Contrast**: Minimum 4.5:1 for text
- **Focus Indicators**: Visible focus states on all interactive elements
- **Semantic HTML**: Use proper heading hierarchy (h1, h2, h3, etc.)
- **ARIA Labels**: Provide descriptive labels for screen readers
- **Keyboard Navigation**: All features accessible via keyboard

### Implementation
- Use Material-UI's built-in accessibility features
- Test with keyboard navigation
- Use color + patterns (not color alone for distinction)
- Provide alt text for images
- Use `aria-label` for icon-only buttons

## Responsive Design

### Breakpoints
- **Mobile**: < 600px (xs)
- **Tablet**: 600px - 960px (sm, md)
- **Desktop**: > 960px (lg, xl)

### Responsive Patterns
- **Single Column**: Mobile (xs)
- **Two Column**: Tablet (sm, md)
- **Three+ Column**: Desktop (lg, xl)
- **Sidebar**: Collapsible on mobile

### Mobile Considerations
- Touch targets: Minimum 44px x 44px
- Spacing: Increase padding on mobile
- Typography: Consider readability at smaller sizes
- Navigation: Use bottom nav or hamburger menu

## Error & Success Handling

### Error States
- Use red color (#ef4444)
- Provide clear error messages
- Include error boundary for crashes
- Show helpful recovery actions

### Success States
- Use green color (#10b981)
- Provide brief confirmation messages
- Auto-dismiss after 3-4 seconds
- Offer undo action where applicable

### Loading States
- Show progress indicators
- Display "Loading..." or skeleton loaders
- Disable interactive elements
- Provide estimated time if > 2 seconds

## Animation & Transitions

### Standard Easing
- **Ease-in-out**: `cubic-bezier(0.4, 0, 0.2, 1)` (default, 0.3s)
- **Ease-out**: Used for entrances
- **Ease-in**: Used for exits

### Common Durations
- **Quick interactions**: 0.15-0.2s
- **Normal transitions**: 0.3s
- **Slower transitions**: 0.5s

### Animation Examples
- **Button hover**: Transform translateY(-2px), shadow increase
- **Card hover**: Transform translateY(-4px), shadow increase
- **Menu items**: Smooth color transition
- **Page transitions**: Fade in with opacity

## Theme Switching

### Light Mode
- Clear, bright backgrounds (#f8fafc)
- High contrast text (#0f172a)
- Soft shadows
- Recommended for daytime use

### Dark Mode
- Dark backgrounds (#0f172a for default, #1e293b for cards)
- Light text (#f1f5f9)
- More saturated colors
- Reduced eye strain for evening use

## Component Library

### Available Components
1. **ErrorBoundary**: Captures and displays errors
2. **LoadingState**: Skeleton loaders for async data
3. **EmptyState**: User-friendly empty views
4. **StatCard**: Metric display with trends
5. **MainLayout**: Main application layout with AppBar & Sidebar
6. **AppBar**: Top navigation bar
7. **Sidebar**: Left navigation menu
8. **ProtectedRoute**: Route authentication wrapper

## Best Practices

### Code Organization
- Keep components small and focused
- Use TypeScript for type safety
- Extract reusable logic to hooks
- Organize imports alphabetically

### Performance
- Lazy load routes
- Use React Query for data fetching
- Memoize expensive computations
- Optimize images and assets

### Accessibility
- Always include alt text
- Use semantic HTML
- Provide keyboard shortcuts
- Test with screen readers

### Testing
- Test responsive designs on real devices
- Test keyboard navigation
- Test with multiple themes
- Validate color contrast

## Future Enhancements

1. **Advanced Animation Library**: Consider Framer Motion for complex animations
2. **Component Variants**: Add more button, card, and input variations
3. **Icon System**: Standardize icon sizing and usage
4. **Toast Notifications**: Create notification system for feedback
5. **Breadcrumbs**: Add breadcrumb navigation for nested pages
6. **Data Table**: Create reusable data table component
7. **Form Validation**: Comprehensive form validation system
8. **Modals/Dialogs**: Standardized modal component

## References

- Material-UI Documentation: https://mui.com
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Tailwind Design System: https://tailwindcss.com
- Inter Font: https://rsms.me/inter/
