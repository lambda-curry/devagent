---
description: Guidelines for proper useEffect usage based on React's "You Might Not Need an Effect" principles, emphasizing when to avoid effects and how to use them correctly for synchronization with external systems.
alwaysApply: false
---

# useEffect Patterns & Anti-Patterns

## 🎯 Core Principle: "You Might Not Need an Effect"

**Effects are an escape hatch from the React paradigm.** They let you "step outside" of React and synchronize your components with external systems. If there is no external system involved, you shouldn't need an Effect.

## ❌ Common Anti-Patterns to Avoid

### 1. **Don't Use Effects for Data Transformation**

```tsx
// ❌ WRONG: Redundant state and unnecessary Effect
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);

  return <div>{fullName}</div>;
}

// ✅ CORRECT: Calculate during rendering
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');
  
  // Calculate during rendering - no Effect needed
  const fullName = firstName + ' ' + lastName;

  return <div>{fullName}</div>;
}
```

### 2. **Don't Use Effects for Expensive Calculations**

```tsx
// ❌ WRONG: Storing calculated values in state
function TodoList({ todos, filter }) {
  const [visibleTodos, setVisibleTodos] = useState([]);

  useEffect(() => {
    setVisibleTodos(getFilteredTodos(todos, filter));
  }, [todos, filter]);

  return <ul>{visibleTodos.map(todo => <li key={todo.id}>{todo.text}</li>)}</ul>;
}

// ✅ CORRECT: Calculate during rendering
function TodoList({ todos, filter }) {
  // Calculate during rendering
  const visibleTodos = getFilteredTodos(todos, filter);

  return <ul>{visibleTodos.map(todo => <li key={todo.id}>{todo.text}</li>)}</ul>;
}

// ✅ CORRECT: Use useMemo for expensive calculations
function TodoList({ todos, filter }) {
  const visibleTodos = useMemo(() => {
    return getFilteredTodos(todos, filter);
  }, [todos, filter]);

  return <ul>{visibleTodos.map(todo => <li key={todo.id}>{todo.text}</li>)}</ul>;
}
```

### 3. **Don't Use Effects for User Events**

```tsx
// ❌ WRONG: Effect for user interaction
function BuyButton({ productId }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      fetch('/api/buy', { method: 'POST', body: JSON.stringify({ productId }) })
        .then(() => setIsLoading(false));
    }
  }, [isLoading, productId]);

  return <button onClick={() => setIsLoading(true)}>Buy</button>;
}

// ✅ CORRECT: Handle in event handler
function BuyButton({ productId }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/buy', { method: 'POST', body: JSON.stringify({ productId }) });
    } finally {
      setIsLoading(false);
    }
  };

  return <button onClick={handleBuy} disabled={isLoading}>Buy</button>;
}
```

## ✅ When You DO Need Effects

### 1. **Synchronizing with External Systems**

```tsx
// ✅ CORRECT: Synchronizing with external store
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### 2. **DOM Event Listeners**

```tsx
// ✅ CORRECT: Click outside to close dropdown
function Dropdown({ children, isOpen, onClose }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return <div ref={ref}>{children}</div>;
}
```

### 3. **Data Fetching with Cleanup**

```tsx
// ✅ CORRECT: Data fetching with race condition protection
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let ignore = false;

    fetchResults(query).then(json => {
      if (!ignore) {
        setResults(json);
      }
    });

    return () => {
      ignore = true;
    };
  }, [query]);

  return <div>{results.map(result => <div key={result.id}>{result.title}</div>)}</div>;
}
```

### 4. **Auto-scrolling (DOM Manipulation)**

```tsx
// ✅ CORRECT: Auto-scroll to bottom when messages change
function MessageList({ messages }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div>
      {messages.map(message => <div key={message.id}>{message.text}</div>)}
      <div ref={messagesEndRef} />
    </div>
  );
}
```

## 🔧 Advanced Patterns

### 1. **Custom Hooks for Reusable Effects**

```tsx
// ✅ CORRECT: Extract effect logic into custom hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  // Use debouncedQuery for API calls
}
```

### 2. **Effect Dependencies Best Practices**

```tsx
// ✅ CORRECT: Stable dependencies
function Component({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let ignore = false;

    fetchUser(userId).then(userData => {
      if (!ignore) {
        setUser(userData);
      }
    });

    return () => {
      ignore = true;
    };
  }, [userId]); // Only userId as dependency

  return <div>{user?.name}</div>;
}

// ✅ CORRECT: Using useRef for stable function references
function Component({ onUpdate }) {
  const [data, setData] = useState(null);
  const onUpdateRef = useRef(onUpdate);

  // Keep ref updated without triggering effect re-runs
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  useEffect(() => {
    // Use ref.current to always get latest callback
    onUpdateRef.current?.(data);
  }, [data]); // No need to include onUpdate

  return <div>{data}</div>;
}
```

## 🚫 What NOT to Do

### 1. **Don't Use Effects for State Updates Based on Props**

```tsx
// ❌ WRONG: Effect to update state from props
function Component({ initialValue }) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return <div>{value}</div>;
}

// ✅ CORRECT: Use key prop to reset component state
function Parent() {
  const [key, setKey] = useState(0);
  
  return <Component key={key} initialValue={newValue} />;
}
```

### 2. **Don't Use Effects for Computed Values**

```tsx
// ❌ WRONG: Effect for computed value
function Component({ items }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price, 0));
  }, [items]);

  return <div>Total: ${total}</div>;
}

// ✅ CORRECT: Calculate during render
function Component({ items }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return <div>Total: ${total}</div>;
}
```

## 📋 Decision Tree

**Ask yourself these questions before using useEffect:**

1. **Is this synchronizing with an external system?** (browser APIs, network, timers, etc.)
   - ✅ YES → Use Effect
   - ❌ NO → Continue to question 2

2. **Is this updating state based on props/state changes?**
   - ✅ YES → Calculate during render or use key prop
   - ❌ NO → Continue to question 3

3. **Is this handling a user event?**
   - ✅ YES → Use event handler
   - ❌ NO → Continue to question 4

4. **Is this a computed value?**
   - ✅ YES → Calculate during render or use useMemo
   - ❌ NO → You probably don't need an Effect

## 🎯 Key Takeaways

- **Effects are for synchronization with external systems**
- **Calculate derived state during rendering**
- **Handle user events in event handlers**
- **Use useMemo for expensive calculations**
- **Always clean up subscriptions and timers**
- **Use custom hooks to extract reusable effect logic**

## 🔍 Code Review Checklist

- [ ] Is this Effect synchronizing with an external system?
- [ ] Could this be calculated during rendering instead?
- [ ] Is this handling a user event that should be in an event handler?
- [ ] Are all dependencies correctly listed?
- [ ] Is there proper cleanup for subscriptions/timers?
- [ ] Could this logic be extracted into a custom hook?

---

*Remember: The goal is to minimize Effects and keep components simple. When in doubt, ask "What external system am I synchronizing with?"*
