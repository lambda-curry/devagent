---
description: Guidelines for using @lambdacurry/forms library with Remix Hook Form and Zod validation
fileMatching: "app/**/*.tsx, app/**/*.ts, components/**/*.tsx, components/**/*.ts"
alwaysApply: true
---

**Summary:**
This document provides essential guidelines for using `@lambdacurry/forms` with `remix-hook-form` and Zod v4. Key benefits include progressive enhancement, type safety, consistent UI, and WCAG 2.1 AA accessibility compliance. Always prefer `remix-hook-form` over other form libraries in React Router applications.

**Reference Documentation:** https://raw.githubusercontent.com/lambda-curry/forms/refs/heads/main/llms.txt

## Core Architecture & Setup

**@lambdacurry/forms** provides form-aware wrapper components that automatically integrate with React Router and Remix Hook Form context, eliminating boilerplate while maintaining full customization.

### Essential Imports & Setup
```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { RemixFormProvider, useRemixForm, getValidatedFormData } from 'remix-hook-form';
import { z } from 'zod';
import { useFetcher } from 'react-router';
import { TextField, Checkbox, RadioGroup, DatePicker, FormError, Textarea } from '@lambdacurry/forms';
import { Button } from '@lambdacurry/forms/ui';
```

### Zod Schema Patterns
```typescript
const formSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.boolean().refine(val => val === true, 'You must accept terms'),
});

type FormData = z.infer<typeof formSchema>;
```

## Standard Form Implementation Pattern

### Complete Login Form Example with FormError
```typescript
const LoginForm = () => {
  const fetcher = useFetcher<{
    message?: string;
    errors?: Record<string, { message: string }>
  }>();

  const methods = useRemixForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
    fetcher,
    submitConfig: { action: '/login', method: 'post' },
  });

  const isSubmitting = fetcher.state === 'submitting';

  return (
    <RemixFormProvider {...methods}>
      <fetcher.Form onSubmit={methods.handleSubmit}>
        <TextField
          name="email"
          type="email"
          label="Email Address"
        />

        <TextField
          name="password"
          type="password"
          label="Password"
        />

        {/* Place FormError before the submit button for critical errors */}
        <FormError />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </fetcher.Form>
    </RemixFormProvider>
  );
};
```

### Server Action Handler with FormError Support
```typescript
import { data } from 'react-router';
import type { Route } from './+types/route-name';

export const action = async ({ request }: Route.ActionArgs) => {
  const { data: formData, errors } = await getValidatedFormData<FormData>(
    request,
    zodResolver(formSchema)
  );

  if (errors) return data({ errors }, { status: 400 });

  try {
    const result = await processData(formData);
    return data({ message: 'Success!' });
  } catch (error) {
    // Form-level error using _form key
    return data({
      errors: {
        _form: { message: 'An error occurred. Please try again.' }
      }
    }, { status: 500 });
  }
};
```

## Available Form Components

### TextField Component
```typescript
<TextField
  name="fieldName"
  label="Field Label"
  type="text|email|password|number"
  placeholder="Enter text"
/>
```

### Textarea Component
```typescript
<Textarea
  name="message"
  label="Message"
  placeholder="Enter your message..."
  rows={4}
/>
```

### Checkbox Component
```typescript
<Checkbox
  name="terms"
  label="Accept Terms and Conditions"
/>
```

### RadioGroup Component
```typescript
// Pattern 1: Using options prop
<RadioGroup
  name="size"
  label="Select Size"
  options={[
    { value: 'sm', label: 'Small' },
    { value: 'lg', label: 'Large' },
  ]}
/>

// Pattern 2: Using RadioGroupItem children
<RadioGroup name="type" label="Type">
  <RadioGroupItem value="personal" label="Personal" />
  <RadioGroupItem value="business" label="Business" />
</RadioGroup>
```

### Other Components
```typescript
<DatePicker name="birthDate" label="Birth Date" />
<DropdownMenuSelect name="country" label="Country">
  <DropdownMenuSelectItem value="us">United States</DropdownMenuSelectItem>
</DropdownMenuSelect>
<OTPInput name="otp" label="Verification Code" maxLength={6} />
<HiddenField name="taskId" />
```

## Error Handling

### FormError Component
The `FormError` component automatically displays form-level errors from the `_form` key in server responses.

**Error Handling:**
- Form-level errors: Use `<FormError />` component (place before submit button)
- Field errors: Display automatically via `FormMessage` component
- Server validation: Return `{ errors: { _form: { message: 'Error message' } } }`

```typescript
// Basic usage - displays errors from _form key
<FormError />

// Custom error key
<FormError name="custom" />

// With styling
<FormError className="mb-4 p-3 bg-red-50 border border-red-200 rounded" />
```

## Advanced Patterns

### Custom Submit Handlers
```typescript
const methods = useRemixForm<FormData>({
  resolver: zodResolver(formSchema),
  fetcher,
  submitConfig: { action: '/', method: 'post' },
  submitHandlers: {
    onValid: (data) => {
      const transformedData = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      fetcher.submit(createFormData(transformedData), { method: 'post', action: '/' });
    },
  },
});
```

### Conditional Fields
```typescript
const watchAccountType = methods.watch('accountType');

{watchAccountType === 'business' && (
  <TextField name="companyName" label="Company Name" />
)}
```

### Component Customization
```typescript
const CustomInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full rounded-lg border-2 border-purple-300 bg-purple-50"
  />
);

<TextField
  name="email"
  components={{ Input: CustomInput }}
/>
```

## Best Practices

### ✅ DO
- Use `remix-hook-form` over plain React Hook Form
- Leverage `getValidatedFormData()` for server-side validation
- Use `createFormData()` for custom submissions
- Import components from `@lambdacurry/forms`
- Use `FormError` for form-level error display (place before submit button)
- Handle both client and server validation
- Use `items-start` on grid containers for side-by-side inputs to prevent wrapper stretching

### ❌ DON'T
- Mix form libraries (avoid `useForm` from react-hook-form directly)
- Use manual FormData parsing with remix-hook-form
- Pass `control` props manually (components access context automatically)
- Place FormError at inconsistent locations

## Performance & Accessibility

- **Accessibility**: WCAG 2.1 AA compliance built-in
- **Performance**: Client-side filtering for <1000 items, server-side for larger datasets
- **Progressive Enhancement**: Forms work without JavaScript
- **Type Safety**: Full TypeScript integration with Zod inference

## Testing Patterns
```typescript
// Unit testing
test('form validation works', async () => {
  const { errors, data } = await getValidatedFormData(request, zodResolver(schema));
  expect(errors).toBeNull();
  expect(data.email).toBe('test@example.com');
});

// E2E testing with FormError
test('form works without JS', async ({ page }) => {
  await page.context().setJavaScriptEnabled(false);
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  await expect(page.locator('[data-testid="form-error"]')).toBeVisible();
});
```

This modern form framework provides type-safe, accessible, and performant forms with minimal boilerplate while maintaining full customization capabilities.
