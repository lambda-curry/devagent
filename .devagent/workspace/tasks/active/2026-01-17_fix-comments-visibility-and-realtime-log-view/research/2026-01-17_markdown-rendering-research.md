# Markdown Rendering Research for Task Comments

**Task:** devagent-201a.11  
**Date:** 2026-01-17  
**Status:** Complete

## Problem Statement

Task comments contain markdown formatting (bold, code blocks, lists, checkmarks) but are currently rendered as plaintext in the `Comments.tsx` component, making structured information harder to parse.

## Research Areas

1. Popular React markdown libraries
2. Bundle size, features, security, performance
3. GitHub-flavored markdown (GFM) support
4. Syntax highlighting for code blocks
5. Security considerations (XSS prevention)

---

## Library Comparison Matrix

| Library | Unpacked Size | GFM Support | React Native | Security | Customization | Performance |
|---------|---------------|-------------|--------------|----------|---------------|-------------|
| **react-markdown** | ~53KB | Plugin (remark-gfm) | No | Built-in URL sanitization | Excellent (components prop) | Good |
| **marked** | ~433KB | Built-in | No | Manual (DOMPurify needed) | Moderate | Excellent |
| **markdown-it** | ~767KB | Plugin | No | Manual (DOMPurify needed) | Good (plugins) | Good |

### Detailed Analysis

#### 1. react-markdown (Recommended)

**Version:** 10.1.0  
**Unpacked Size:** 52,637 bytes (~53KB)

**Pros:**
- Purpose-built for React - renders as React elements, not raw HTML
- Built-in XSS protection via `defaultUrlTransform` (blocks `javascript:`, `data:` URLs)
- Excellent component customization via `components` prop
- Plugin architecture (remark/rehype ecosystem)
- Type-safe with full TypeScript support
- Small footprint compared to alternatives
- Active maintenance by Unified.js collective

**Cons:**
- Requires `remark-gfm` plugin for GFM features (~22KB additional)
- No streaming support (see Streamdown for that use case)

**Security:**
- URLs are sanitized by default (allows http, https, mailto, xmpp, irc, ircs)
- No raw HTML injection by default
- Can use `rehype-sanitize` for additional protection

**Dependencies:**
- `react-markdown`: ~53KB
- `remark-gfm` (optional, for GFM): ~22KB
- Total with GFM: ~75KB

#### 2. marked

**Version:** 17.0.1  
**Unpacked Size:** 432,701 bytes (~433KB)

**Pros:**
- Very fast parsing
- Built-in GFM support
- Zero dependencies
- Works anywhere (browser, Node.js)

**Cons:**
- Outputs raw HTML string - requires `dangerouslySetInnerHTML`
- No built-in XSS protection - requires DOMPurify
- Less React-idiomatic
- Larger bundle size
- Component customization requires more work

**Security:**
- Outputs raw HTML - HIGH RISK without sanitization
- Requires DOMPurify (~65KB minified) or similar

#### 3. markdown-it

**Version:** 14.1.0  
**Unpacked Size:** 767,399 bytes (~767KB)

**Pros:**
- Highly extensible plugin system
- Excellent CommonMark compliance
- Well-documented

**Cons:**
- Largest bundle size
- Outputs raw HTML string
- Requires DOMPurify for security
- Overkill for simple comment rendering

**Security:**
- Same concerns as marked - requires external sanitization

---

## GFM Features Needed

Based on typical Beads task comments, we need:

| Feature | Importance | react-markdown + remark-gfm |
|---------|------------|----------------------------|
| **Bold/Italic** | High | ✅ Built-in |
| **Code blocks** | High | ✅ Built-in |
| **Inline code** | High | ✅ Built-in |
| **Task lists** | High | ✅ With remark-gfm |
| **Links** | Medium | ✅ Built-in |
| **Bullet lists** | High | ✅ Built-in |
| **Strikethrough** | Low | ✅ With remark-gfm |
| **Tables** | Low | ✅ With remark-gfm |
| **Autolinks** | Low | ✅ With remark-gfm |

---

## Syntax Highlighting Options

For code block syntax highlighting:

| Library | Size | Approach | Recommendation |
|---------|------|----------|----------------|
| **rehype-highlight** | ~26KB | rehype plugin with highlight.js | Good for server-side |
| **react-syntax-highlighter** | ~800KB+ | Full-featured, many themes | Heavy, skip for now |
| **Tailwind prose** | 0KB | CSS-only styling | Start here |

**Recommendation:** Start without syntax highlighting. Use Tailwind CSS styling for code blocks. Add `rehype-highlight` later if users request it.

---

## Security Considerations

### XSS Prevention

**react-markdown provides:**
1. **URL sanitization** - `defaultUrlTransform` blocks dangerous protocols
2. **No raw HTML** - Converts markdown to React elements, not innerHTML
3. **Controlled rendering** - Use `allowedElements` to whitelist tags

**Implementation:**
```tsx
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Secure by default - no additional sanitization needed
<Markdown remarkPlugins={[remarkGfm]}>{comment.body}</Markdown>
```

**Additional hardening (optional):**
```tsx
import rehypeSanitize from 'rehype-sanitize';

<Markdown 
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeSanitize]}
>
  {comment.body}
</Markdown>
```

### Why NOT marked/markdown-it

Both output raw HTML strings requiring `dangerouslySetInnerHTML`:
```tsx
// ❌ DANGEROUS without DOMPurify
<div dangerouslySetInnerHTML={{ __html: marked(comment.body) }} />

// ✅ Requires DOMPurify (~65KB) for safety
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(comment.body)) }} />
```

This adds complexity and bundle size with no benefit over react-markdown.

---

## Performance Considerations

### Rendering Many Comments

**Concern:** Task detail pages may have 10-50+ comments.

**Mitigations:**
1. **react-markdown memoization** - Wrap in `React.memo` if needed
2. **Virtual scrolling** - Not needed unless 100+ comments (unlikely)
3. **Parse caching** - react-markdown handles efficiently

**Benchmark:** react-markdown parses ~10KB markdown in <5ms on modern hardware.

### Bundle Impact

| Scenario | Additional Bundle Size |
|----------|----------------------|
| Minimal (react-markdown only) | ~53KB |
| With GFM (recommended) | ~75KB |
| With GFM + sanitize | ~96KB |
| With GFM + syntax highlighting | ~101KB |

**Verdict:** ~75KB for full GFM support is acceptable for a monitoring UI.

---

## Recommendation

### Primary Choice: react-markdown + remark-gfm

**Rationale:**
1. **React-native** - Renders as React elements, not innerHTML
2. **Secure by default** - No XSS vectors without explicit opt-in
3. **Small footprint** - ~75KB total with GFM
4. **Excellent DX** - Component customization via `components` prop
5. **Ecosystem** - Large plugin ecosystem for future needs
6. **TypeScript** - Full type definitions

### Implementation Plan

#### Phase 1: Basic Markdown (This Task)
```bash
bun add react-markdown remark-gfm
```

```tsx
// app/components/Markdown.tsx
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  children: string;
  className?: string;
}

export function MarkdownContent({ children, className }: MarkdownContentProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      className={className}
      components={{
        // Custom styling for task comments
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          return isInline ? (
            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          ) : (
            <code className={`block bg-muted p-3 rounded-lg overflow-x-auto ${className}`} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-muted rounded-lg overflow-x-auto my-2">{children}</pre>
        ),
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm">{children}</li>
        ),
        // Task list checkboxes (GFM)
        input: ({ checked, ...props }) => (
          <input 
            type="checkbox" 
            checked={checked} 
            disabled 
            className="mr-2 rounded"
            {...props}
          />
        ),
      }}
    >
      {children}
    </Markdown>
  );
}
```

#### Phase 2: Update Comments.tsx
```tsx
// Replace plaintext rendering with Markdown
import { MarkdownContent } from './Markdown';

// In Comments component:
<div className="text-sm text-foreground">
  <MarkdownContent>{comment.body}</MarkdownContent>
</div>
```

#### Phase 3 (Future): Syntax Highlighting
```bash
bun add rehype-highlight
```

---

## Files to Modify

1. **app/components/Markdown.tsx** - New component (create)
2. **app/components/Comments.tsx** - Use MarkdownContent instead of plaintext
3. **package.json** - Add react-markdown, remark-gfm

---

## Testing Considerations

1. **Unit tests** for Markdown component with various inputs
2. **XSS test cases** - Ensure dangerous content is sanitized
3. **Rendering tests** - GFM features render correctly
4. **Performance test** - Rendering 50+ comments doesn't lag

---

## Conclusion

**react-markdown + remark-gfm** is the clear choice for this use case:
- React-native rendering (no innerHTML)
- Built-in security
- Small bundle impact (~75KB)
- Excellent customization
- Active maintenance

The implementation is straightforward and can be completed in the next task (devagent-201a.12).
