# Design Deliverables: Login Page & Forgot Password Flow

## Artifacts

### Storybook Stories (Design Mockups)

Three Storybook stories have been created to serve as design mockups and acceptance test references:

1. **`auth/LoginPage`** (`app/components/auth/LoginPage.stories.tsx`)
   - Default state with form fields and forgot password link
   - Dark theme variant
   - Keyboard navigation test
   - Forgot password link interaction test

2. **`auth/ForgotPasswordPage`** (`app/components/auth/ForgotPasswordPage.stories.tsx`)
   - Default state with email submission form
   - Dark theme variant
   - Keyboard navigation test

3. **`auth/ResetPasswordPage`** (`app/components/auth/ResetPasswordPage.stories.tsx`)
   - Default state with password reset form
   - Dark theme variant
   - Keyboard navigation test

**View in Storybook:** Run `bun run storybook` and navigate to the `auth/` section.

### Design Specification Document

Complete design specification available at:
`.devagent/workspace/tasks/active/2026-01-21_add-authentication-login-forgot-password/design-spec.md`

## Intent + Observable Acceptance

### Design Intent
Users should be able to securely authenticate and recover their accounts through a clear, accessible flow. The login page should be the primary entry point with a visible path to password recovery. All states should be deterministic and testable.

### Observable Acceptance Criteria

**Login Page (`/login`):**
- Email input field is visible, labeled, and focusable
- Password input field is visible, labeled, and focusable
- "Forgot password?" link is visible below password label (right-aligned)
- Submit button is enabled and labeled "Sign in"
- Keyboard navigation: Tab order is Email → Password → Forgot password link → Submit button
- All interactive elements have visible focus indicators

**Forgot Password Request Page (`/forgot-password`):**
- Email input field is visible, labeled, and focusable
- Submit button is enabled and labeled "Send reset link"
- "Back to sign in" link is visible below submit button (centered)
- Success state: Shows success message after submission
- Keyboard navigation: Tab order is Email → Submit button → Back to sign in link

**Password Reset Page (`/reset-password/:token`):**
- Password and confirm password input fields are visible, labeled, and focusable
- Password requirements hint is visible
- Submit button is enabled and labeled "Reset password"
- Keyboard navigation: Tab order is Password → Confirm password → Submit button

## Component Inventory / Reuse List

### Existing UI Components (Reuse)

- **Button** (`app/components/ui/button.tsx`)
  - Variants: `default` (primary), `outline`, `secondary`
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

- **Form** (`react-router`)
  - Usage: All form submissions (login, forgot password, reset password)
  - Method: `POST`
  - Action: Route-specific API endpoints

### No New Components Required
All necessary UI primitives exist. Forms use React Router's native `<Form>` component with existing UI components.

## Login Page Mockup / Wireframe

The Storybook story `auth/LoginPage` serves as the visual mockup. Key design elements:

- **Layout**: Centered card (`max-w-md`) on full viewport height
- **Form Structure**:
  - CardHeader: "Sign in" title + description
  - CardContent: Form with email and password fields
  - Forgot password link: Right-aligned below password label
  - Submit button: Full width, primary variant

**Visual Reference:** See `auth/LoginPage` story in Storybook.

## Forgot Password Flow Diagram

```
Login Page (/login)
  └─> Click "Forgot password?" link
      └─> Forgot Password Page (/forgot-password)
          └─> Submit email
              └─> Success message: "Check your email for a reset link"
                  └─> Email sent with reset token
                      └─> User clicks email link
                          └─> Reset Password Page (/reset-password/:token)
                              └─> Submit new password
                                  └─> Success: Redirect to login with success message
```

See full ASCII flow diagram in `design-spec.md`.

## Design Decisions

### Forgot Password Link Placement
- **Position**: Right-aligned below password label, same row
- **Styling**: Primary color, underline on hover, focus ring
- **Accessibility**: Clear accessible name "Forgot password?"
- **Rationale**: Visible but not intrusive, follows common UX patterns

### Accessibility
- All inputs have associated `<label>` elements with `htmlFor` attributes
- Use `aria-required="true"` and `aria-describedby` for form fields
- Screen reader text using `sr-only` class for descriptive text
- All interactive elements have visible focus rings
- Logical tab order throughout all forms

### Layout & Typography
- Centered card layout with `max-w-md` constraint
- Full viewport height (`min-h-dvh`) for vertical centering
- Consistent spacing using design tokens (`var(--space-*)`)
- CardTitle for page headings, CardDescription for subheadings

## Cross-Task Guidance

### For Engineering Tasks (devagent-vom.2, devagent-vom.3, devagent-vom.4)
- Use Storybook stories as implementation reference
- Follow component inventory - no new components needed
- Implement routes per flow diagram
- Use React Router v7 `<Form>` component with `method="post"`
- Handle form submissions in route `action` functions
- Use `throw data()` for error responses (per error-handling.mdc rules)

### For QA Task (devagent-vom.6)
- Storybook stories provide visual regression references
- All form states are deterministic (idle, submitting, error, success)
- Keyboard navigation is testable via Storybook interaction tests
- Form validation errors are testable via DOM assertions

## References

- Design Specification: `.devagent/workspace/tasks/active/2026-01-21_add-authentication-login-forgot-password/design-spec.md`
- Storybook Stories: `app/components/auth/*.stories.tsx`
- React Router v7 Error Handling: `.cursor/rules/error-handling.mdc`
- React Router v7 Framework Rules: `.cursor/rules/react-router-7.mdc`

Signed: Design Agent — Pixel Perfector
