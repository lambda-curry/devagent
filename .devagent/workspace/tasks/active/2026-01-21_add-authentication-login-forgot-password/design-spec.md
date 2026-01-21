# Login Page & Forgot Password Flow - Design Specification

## Design Intent

Users should be able to securely authenticate and recover their accounts through a clear, accessible flow. The login page should be the primary entry point with a visible path to password recovery. All states should be deterministic and testable.

## Observable Acceptance Criteria

### Login Page (`/login`)
- ✅ Email input field is visible, labeled, and focusable
- ✅ Password input field is visible, labeled, and focusable
- ✅ "Forgot password?" link is visible below the password label (right-aligned)
- ✅ Submit button is enabled and labeled "Sign in"
- ✅ Form fields have accessible names (aria-label or associated label)
- ✅ Keyboard navigation: Tab order is Email → Password → Forgot password link → Submit button
- ✅ All interactive elements have visible focus indicators
- ✅ Form validation shows errors inline (if implemented)
- ✅ Loading state: Submit button shows loading indicator during submission
- ✅ Error state: Error message displayed above form (if authentication fails)

### Forgot Password Request Page (`/forgot-password`)
- ✅ Email input field is visible, labeled, and focusable
- ✅ Submit button is enabled and labeled "Send reset link"
- ✅ "Back to sign in" link is visible below submit button (centered)
- ✅ Success state: After submission, shows success message "Check your email for a reset link"
- ✅ Error state: Shows error message if email not found or invalid
- ✅ Keyboard navigation: Tab order is Email → Submit button → Back to sign in link

### Password Reset Page (`/reset-password/:token`)
- ✅ Password input field is visible, labeled, and focusable
- ✅ Confirm password input field is visible, labeled, and focusable
- ✅ Password requirements hint is visible (e.g., "Must be at least 8 characters long")
- ✅ Submit button is enabled and labeled "Reset password"
- ✅ Error state: Shows error if token is invalid/expired
- ✅ Success state: After successful reset, redirects to login page with success message
- ✅ Keyboard navigation: Tab order is Password → Confirm password → Submit button

## Component Inventory & Reuse

### Existing UI Components (Reuse)
- **Button** (`app/components/ui/button.tsx`)
  - Variants: `default` (primary), `outline`, `secondary`
  - Sizes: `default`, `sm`, `lg`
  - Usage: Submit buttons, link buttons (with `asChild` prop)
  
- **Input** (`app/components/ui/input.tsx`)
  - Types: `text`, `email`, `password`
  - Usage: Email, password, confirm password fields
  - Supports: `required`, `aria-required`, `aria-describedby`, `autoComplete`
  
- **Card** (`app/components/ui/card.tsx`)
  - Components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
  - Usage: Container for login/forgot password/reset password forms
  - Layout: Centered on page with max-width constraint

- **Link** (`react-router`)
  - Usage: "Forgot password?" link, "Back to sign in" link
  - Styling: Use `text-primary underline-offset-4 hover:underline` for link styling

### Form Components (React Router v7)
- **Form** (`react-router`)
  - Usage: All form submissions (login, forgot password, reset password)
  - Method: `POST`
  - Action: Route-specific API endpoints (`/api/login`, `/api/forgot-password`, `/api/reset-password`)

### No New Components Required
All necessary UI primitives exist. Forms use React Router's native `<Form>` component with existing UI components.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN PAGE                               │
│                    (/login)                                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Sign in                                                 │   │
│  │                                                           │   │
│  │  Email: [________________]                               │   │
│  │  Password: [________________]  Forgot password? ←───────────┼───┼──┐
│  │                                                           │   │  │
│  │  [Sign in]                                               │   │  │
│  └─────────────────────────────────────────────────────────┘   │  │
└─────────────────────────────────────────────────────────────────┘  │
                                                                      │
                                                                      │
┌─────────────────────────────────────────────────────────────────┐ │
│                    FORGOT PASSWORD PAGE                          │ │
│                  (/forgot-password)                               │ │
│                                                                   │ │
│  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  Forgot password                                         │   │ │
│  │                                                           │   │ │
│  │  Email: [________________]                               │   │ │
│  │                                                           │   │ │
│  │  [Send reset link]                                       │   │ │
│  │                                                           │   │ │
│  │  Back to sign in ←───────────────────────────────────────┼───┼─┘
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✓ Success! Check your email for a reset link           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                                                      
                                                                      
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL (User's Inbox)                         │
│                                                                   │
│  Subject: Reset your password                                    │
│                                                                   │
│  Click this link to reset your password:                         │
│  https://app.example.com/reset-password/{token}                  │
└─────────────────────────────────────────────────────────────────┘
                                                                      
                                                                      
┌─────────────────────────────────────────────────────────────────┐
│                    RESET PASSWORD PAGE                           │
│              (/reset-password/:token)                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Reset password                                          │   │
│  │                                                           │   │
│  │  New password: [________________]                        │   │
│  │    Must be at least 8 characters long                   │   │
│  │                                                           │   │
│  │  Confirm password: [________________]                    │   │
│  │    Re-enter your password to confirm                     │   │
│  │                                                           │   │
│  │  [Reset password]                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✓ Password reset successful! Redirecting to login...    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                                                      
                                                                      
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN PAGE                               │
│                    (/login)                                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✓ Password reset successful! You can now sign in.       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Design Decisions

### Layout
- **Centered card layout**: All auth pages use a centered `Card` component with `max-w-md` constraint
- **Full viewport height**: Pages use `min-h-dvh` to center content vertically
- **Consistent spacing**: Use design tokens (`var(--space-*)`) for consistent spacing

### Typography
- **CardTitle**: Page heading (e.g., "Sign in", "Forgot password")
- **CardDescription**: Subheading explaining the page purpose
- **Label text**: `text-sm font-medium` for form field labels
- **Helper text**: `text-xs text-muted-foreground` for field descriptions

### Accessibility
- **Labels**: All inputs have associated `<label>` elements with `htmlFor` attributes
- **ARIA attributes**: Use `aria-required="true"` and `aria-describedby` for form fields
- **Screen reader text**: Use `sr-only` class for descriptive text that's only visible to screen readers
- **Focus indicators**: All interactive elements have visible focus rings (handled by component styles)
- **Keyboard navigation**: Logical tab order throughout all forms

### Forgot Password Link Placement
- **Position**: Right-aligned below password label, same row
- **Styling**: Primary color, underline on hover, focus ring
- **Accessibility**: Clear accessible name "Forgot password?"
- **Rationale**: Visible but not intrusive, follows common UX patterns

### Error States
- **Display location**: Above form fields, within CardContent
- **Styling**: Use destructive variant for error messages
- **Accessibility**: Error messages associated with form fields via `aria-describedby`

### Success States
- **Forgot password**: Success message replaces form content
- **Reset password**: Success message shown, then redirect to login with success query param
- **Login after reset**: Success message displayed at top of login form

## Storybook Stories

Three Storybook stories have been created to serve as design mockups and acceptance test references:

1. **`auth/LoginPage`** (`app/components/auth/LoginPage.stories.tsx`)
   - Default state
   - Dark theme
   - Keyboard navigation test
   - Forgot password link interaction

2. **`auth/ForgotPasswordPage`** (`app/components/auth/ForgotPasswordPage.stories.tsx`)
   - Default state
   - Dark theme
   - Keyboard navigation test

3. **`auth/ResetPasswordPage`** (`app/components/auth/ResetPasswordPage.stories.tsx`)
   - Default state
   - Dark theme
   - Keyboard navigation test

All stories include:
- Interactive tests using `@storybook/test`
- Router stubs for navigation
- Accessibility assertions
- Keyboard navigation verification

## Implementation Notes

### Routes
- `/login` - Login page
- `/forgot-password` - Forgot password request page
- `/reset-password/:token` - Password reset page (dynamic route)

### API Endpoints
- `POST /api/login` - Authenticate user
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Complete password reset

### Form Handling
- Use React Router v7 `<Form>` component with `method="post"`
- Handle form submissions in route `action` functions
- Use `throw data()` for error responses (per error-handling.mdc rules)
- Use `redirect()` for successful authentication/reset

### Testing Considerations
- All form states are deterministic (idle, submitting, error, success)
- Storybook stories provide visual regression references
- Keyboard navigation is testable via Storybook interaction tests
- Form validation errors are testable via DOM assertions
