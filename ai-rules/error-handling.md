---
description: Framework-native error handling patterns for React Router v7. Use built-in mechanisms like throw data() and ErrorBoundary instead of custom abstractions.
fileMatching: "**/*"
alwaysApply: true
---

# Error Handling Guidelines for React Router v7

## 🎯 Core Principle

**Use React Router v7's built-in error handling mechanisms. Avoid custom error classes or wrapper functions.**

React Router v7 provides excellent error handling out of the box. The framework's philosophy is simple:
- **Return data** when things go well
- **Throw responses** when things go wrong

---

## 🚀 Quick Reference

| Scenario | Pattern | Example |
|----------|---------|---------|
| **404 Not Found** | `throw data(null, { status: 404 })` | User/resource doesn't exist |
| **401 Unauthorized** | `throw data("message", { status: 401 })` | Not logged in |
| **403 Forbidden** | `throw data("message", { status: 403 })` | Insufficient permissions |
| **400 Bad Request** | `throw data({ message, fields }, { status: 400 })` | Form validation failed |
| **500 Server Error** | Let exception throw naturally | Unexpected database error |
| **Form validation** | Local `useState` | Empty required field |
| **Unexpected error** | Let bubble to ErrorBoundary | Network timeout |

---

## 📦 In Loaders/Actions (Server)

### ✅ Throw data() for Expected Errors

```typescript
import { data } from "react-router";
import type { Route } from "./+types/product";

// 404 Not Found
export async function loader({ params }: Route.LoaderArgs) {
  const product = await db.product.findUnique({ 
    where: { id: params.id } 
  });
  
  if (!product) {
    throw data(null, { status: 404 });
  }
  
  return { product };
}

// 401 Unauthorized
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  
  if (!user) {
    throw data("Please log in", { status: 401 });
  }
  
  return { user };
}

// 400 Validation Error
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title");
  
  if (!title || title.trim() === "") {
    throw data(
      { message: "Title is required", field: "title" },
      { status: 400 }
    );
  }
  
  await db.project.create({ data: { title } });
  return { ok: true };
}
```

### ✅ Let Unexpected Errors Throw Naturally

```typescript
// ✅ CORRECT: Don't wrap in try-catch
export async function loader({ params }: Route.LoaderArgs) {
  const data = await db.getData(params.id);
  return { data };
}

// ❌ WRONG: Don't catch unexpected errors
export async function loader({ params }: Route.LoaderArgs) {
  try {
    const data = await db.getData(params.id);
    return { data };
  } catch (error) {
    // Let ErrorBoundary handle unexpected errors!
    throw data("Error loading data", { status: 500 });
  }
}
```

**Why throw instead of return?** Throwing stops execution immediately, keeping your loaders clean and focused on the happy path. You don't need to check return values everywhere.

---

## 🛠️ In Helper Functions

### ✅ Throw to Stop Execution

Helper functions should throw to abort early and simplify caller code:

```typescript
// app/lib/auth.server.ts
import { data } from "react-router";

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw data("Please log in", { status: 401 });
  }
  return user; // Type is guaranteed User, not User | null
}

export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  if (!user.isAdmin) {
    throw data("Forbidden", { status: 403 });
  }
  return user;
}

// Usage in loader - clean and simple!
export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAdmin(request);
  // If we get here, user is guaranteed to be an admin
  const settings = await getAdminSettings();
  return { user, settings };
}
```

### ✅ Parse/Validate with Throws

```typescript
// Helper that throws on invalid input
function parseJSON<T>(text: string): T {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw data("Invalid JSON format", { status: 400 });
  }
}

// Simple usage - no need to check for errors
export async function action({ request }: Route.ActionArgs) {
  const body = await request.text();
  const payload = parseJSON<MyType>(body); // Throws if invalid
  await processData(payload);
  return { ok: true };
}
```

---

## 🎨 In Components

### ✅ Expected Errors: Handle with Local State

For **expected** user-facing validation errors, use local state:

```typescript
import { useState } from "react";

function ChatInterface() {
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const handleSubmit = async (message: string) => {
    // Expected validation - handle locally
    if (!message.trim()) {
      setValidationError("Message cannot be empty");
      return;
    }
    
    setValidationError(null);
    
    // Unexpected errors bubble to ErrorBoundary
    await sendMessage(message);
  };
  
  return (
    <>
      {validationError && <Alert variant="error">{validationError}</Alert>}
      <ChatInput onSubmit={handleSubmit} />
    </>
  );
}
```

### ✅ Unexpected Errors: Let Bubble to ErrorBoundary

For **unexpected** errors, don't catch them - let ErrorBoundary handle it:

```typescript
// ✅ CORRECT: Let ErrorBoundary catch unexpected errors
function ChatInterface() {
  const handleSubmit = async (message: string) => {
    await sendMessage(message); // If this throws, ErrorBoundary catches it
  };
  
  return <ChatInput onSubmit={handleSubmit} />;
}

// ❌ WRONG: Don't catch everything
function ChatInterface() {
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (err) {
      setError((err as Error).message); // ErrorBoundary should handle this!
    }
  };
  
  if (error) return <div>Error: {error}</div>;
  return <ChatInput onSubmit={handleSubmit} />;
}
```

### Decision: Local State vs ErrorBoundary

```
Is this error expected and user-recoverable?
├─ YES (e.g., empty form field, invalid format)
│  └─ Handle with local state
│
└─ NO (e.g., network failure, database error)
   └─ Let bubble to ErrorBoundary
```

---

## 🎭 ErrorBoundary

### ✅ Use Framework Helpers

React Router provides `useRouteError()` and `isRouteErrorResponse()`:

```typescript
// app/root.tsx (or any route file)
import { isRouteErrorResponse, useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();
  
  // Handle thrown responses (from throw data())
  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-page">
        <h1>{error.status} {error.statusText}</h1>
        <p>
          {typeof error.data === "string" 
            ? error.data 
            : error.data?.message || "An error occurred"}
        </p>
      </div>
    );
  }
  
  // Handle unexpected errors
  if (error instanceof Error) {
    return (
      <div className="error-page">
        <h1>Unexpected Error</h1>
        <p>{error.message}</p>
        {process.env.NODE_ENV === "development" && (
          <pre className="error-stack">{error.stack}</pre>
        )}
      </div>
    );
  }
  
  return <h1>Unknown Error</h1>;
}
```

### Route-Specific ErrorBoundary

You can add ErrorBoundary to any route for custom error handling:

```typescript
// app/routes/admin.tsx
import type { Route } from "./+types/admin";

export default function Admin({ loaderData }: Route.ComponentProps) {
  return <AdminDashboard data={loaderData} />;
}

// Custom error UI for admin routes
export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error) && error.status === 403) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access the admin panel.</p>
        <Link to="/">Go Home</Link>
      </div>
    );
  }
  
  // Fall back to default error display
  throw error;
}
```

---

## 📊 Error Logging

### ✅ Central Error Handler

Add to `app/entry.server.tsx` for centralized error logging:

```typescript
import { type HandleErrorFunction } from "react-router";

export const handleError: HandleErrorFunction = (error, { request }) => {
  // Don't log aborted requests (race conditions, user navigated away)
  if (!request.signal.aborted) {
    console.error("Server error:", {
      message: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
    });
    
    // Optional: Send to monitoring service
    // Sentry.captureException(error);
  }
};
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ 1. Custom Error Classes

```typescript
// ❌ DON'T: Overengineered custom error classes
class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} ${id} not found`);
  }
  toResponse() {
    return new Response(this.message, { status: 404 });
  }
}

throw new NotFoundError("User", params.id);

// ✅ DO: Simple and direct
throw data(`User ${params.id} not found`, { status: 404 });
```

### ❌ 2. Wrapper Functions

```typescript
// ❌ DON'T: Unnecessary wrapper functions
function withErrorHandler(fn: LoaderFunction) {
  return async (args) => {
    try {
      return await fn(args);
    } catch (error) {
      // Framework handles this already!
      throw new Response("Error", { status: 500 });
    }
  };
}

export const loader = withErrorHandler(async ({ params }) => {
  // ...
});

// ✅ DO: Just throw directly
export async function loader({ params }: Route.LoaderArgs) {
  const user = await db.user.findUnique({ where: { id: params.id } });
  if (!user) throw data(null, { status: 404 });
  return { user };
}
```

### ❌ 3. Result Types for Simple Operations

```typescript
// ❌ DON'T: Over-complicating with Result types
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function parseJSON<T>(text: string): Result<T, Error> {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

// Then every caller needs to check:
const result = parseJSON(text);
if (!result.ok) throw data(result.error.message, { status: 400 });
const value = result.value;

// ✅ DO: Let it throw naturally
function parseJSON<T>(text: string): T {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw data("Invalid JSON", { status: 400 });
  }
}

// Simpler usage:
const value = parseJSON(text); // Throws if invalid
```

### ❌ 4. Catching Everything

```typescript
// ❌ DON'T: Catch all errors in components
function MyComponent() {
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchData();
        setData(data);
      } catch (err) {
        setError(err as Error); // ErrorBoundary should handle this!
      }
    }
    load();
  }, []);
  
  if (error) return <ErrorDisplay error={error} />;
  // ...
}

// ✅ DO: Use loaders and let ErrorBoundary handle errors
export async function loader() {
  const data = await fetchData(); // If this throws, ErrorBoundary handles it
  return { data };
}

function MyComponent({ loaderData }: Route.ComponentProps) {
  return <Display data={loaderData.data} />;
}
```

---

## 🎯 Decision Tree

Use this flowchart when deciding how to handle errors:

```
Where is the error happening?
│
├─ In a loader/action?
│  └─ Is it expected (404, validation, auth)?
│     ├─ YES → throw data() with status code
│     └─ NO → Let it throw naturally
│
├─ In a helper function?
│  └─ Will this be called from loader/action?
│     ├─ YES → throw data() to stop execution
│     └─ NO → throw data() or return based on context
│
└─ In a component?
   └─ Is it expected and user-recoverable?
      ├─ YES → Handle with local useState
      └─ NO → Let it bubble to ErrorBoundary
```

---

## ✨ Summary

### Key Principles

1. **Use framework-native patterns** - React Router v7 has excellent error handling built-in
2. **`throw data()` is your friend** - Simple, direct, and framework-native
3. **ErrorBoundary catches what matters** - No need to catch everything everywhere
4. **Keep it simple** - Resist the urge to over-engineer
5. **Helper functions can throw** - Stops execution, cleaner code

### The Golden Rule

**When in doubt, throw `data()` with a status code and let ErrorBoundary handle it.**

### What to Use

✅ **DO use:**
- `throw data()` with status codes
- ErrorBoundary for unexpected errors
- Helper functions that throw
- Local state for expected validation

❌ **DON'T use:**
- Custom error classes
- Wrapper functions
- Result types for simple operations
- Try-catch everywhere

---

## 📚 References

### Official Documentation
- [React Router v7 Error Handling](https://reactrouter.com/how-to/error-boundary)
- [React Router v7 Status Codes](https://reactrouter.com/how-to/status)
- [React Router v7 Error Reporting](https://reactrouter.com/how-to/error-reporting)

### Community Resources
- [Sergio Xalambrí - Throwing vs Returning Responses](https://sergiodxa.com/articles/throwing-vs-returning-responses-in-remix)
- [Epic Web - Handle Thrown Responses](https://foundations.epicweb.dev/exercise/07/02/problem)
- [Lambda Curry - Comprehensive Cursor Rules Best Practices](https://www.lambdacurry.dev/blog/comprehensive-cursor-rules-best-practices-guide)

---

*Keep error handling simple and framework-native. React Router v7 has you covered!* 🚀
