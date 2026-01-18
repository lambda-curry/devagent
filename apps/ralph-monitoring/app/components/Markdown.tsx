import { useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownContentProps {
  children: string;
  className?: string;
}

/**
 * MarkdownContent renders markdown text as styled React elements.
 *
 * Features:
 * - GitHub-Flavored Markdown (GFM) support via remark-gfm
 * - Task lists with checkboxes
 * - Code blocks with monospace styling
 * - Safe by default - react-markdown renders as React elements, not innerHTML
 * - Custom styling consistent with the Ralph monitoring UI theme
 *
 * Security:
 * - URLs are sanitized by default (blocks javascript:, data: protocols)
 * - No raw HTML injection - markdown converts to React elements
 * - Links open in new tab with noopener noreferrer
 *
 * Performance:
 * - Components object is memoized to prevent unnecessary re-renders
 * - remarkPlugins array is stable (defined outside component)
 */

// Stable reference for remark plugins - defined outside component to prevent re-renders
const remarkPlugins = [remarkGfm];

export const MarkdownContent = ({ children, className }: MarkdownContentProps) => {
  // Memoize components object to prevent react-markdown from re-rendering
  // This is critical for performance - without memoization, every parent render
  // causes a new components object reference, triggering full markdown re-parse
  const components: Components = useMemo(() => ({
    // Code blocks and inline code
    code: ({ className: codeClassName, children: codeChildren, ...props }) => {
      // Check if this is a code block (has language class) or inline code
      const isInline = !codeClassName;
      return isInline ? (
        <code
          className="bg-muted px-1 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {codeChildren}
        </code>
      ) : (
        <code
          className={`block bg-muted p-3 rounded-lg overflow-x-auto text-sm font-mono ${codeClassName ?? ''}`}
          {...props}
        >
          {codeChildren}
        </code>
      );
    },
    // Pre wrapper for code blocks
    pre: ({ children: preChildren }) => (
      <pre className="bg-muted rounded-lg overflow-x-auto my-2">
        {preChildren}
      </pre>
    ),
    // Links open in new tab with security attributes
    a: ({ href, children: linkChildren }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {linkChildren}
      </a>
    ),
    // Unordered lists
    ul: ({ children: ulChildren }) => (
      <ul className="list-disc list-inside my-2 space-y-1">{ulChildren}</ul>
    ),
    // Ordered lists
    ol: ({ children: olChildren }) => (
      <ol className="list-decimal list-inside my-2 space-y-1">{olChildren}</ol>
    ),
    // List items
    li: ({ children: liChildren }) => (
      <li className="text-sm">{liChildren}</li>
    ),
    // Task list checkboxes (GFM feature)
    input: ({ checked, type, ...props }) => {
      if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={checked}
            disabled
            readOnly
            className="mr-2 rounded"
            {...props}
          />
        );
      }
      return <input type={type} {...props} />;
    },
    // Paragraphs with proper spacing
    p: ({ children: pChildren }) => (
      <p className="my-1">{pChildren}</p>
    ),
    // Strong/bold text
    strong: ({ children: strongChildren }) => (
      <strong className="font-semibold">{strongChildren}</strong>
    ),
    // Emphasis/italic text
    em: ({ children: emChildren }) => (
      <em className="italic">{emChildren}</em>
    ),
    // Headings (scale down for comment context)
    h1: ({ children: h1Children }) => (
      <h1 className="text-lg font-bold mt-3 mb-1">{h1Children}</h1>
    ),
    h2: ({ children: h2Children }) => (
      <h2 className="text-base font-bold mt-3 mb-1">{h2Children}</h2>
    ),
    h3: ({ children: h3Children }) => (
      <h3 className="text-sm font-bold mt-2 mb-1">{h3Children}</h3>
    ),
    // Blockquotes
    blockquote: ({ children: bqChildren }) => (
      <blockquote className="border-l-2 border-muted-foreground/50 pl-3 my-2 italic text-muted-foreground">
        {bqChildren}
      </blockquote>
    ),
    // Horizontal rules
    hr: () => <hr className="my-3 border-border" />,
    // Tables (GFM feature)
    table: ({ children: tableChildren }) => (
      <div className="overflow-x-auto my-2">
        <table className="min-w-full text-sm border-collapse">
          {tableChildren}
        </table>
      </div>
    ),
    thead: ({ children: theadChildren }) => (
      <thead className="bg-muted">{theadChildren}</thead>
    ),
    th: ({ children: thChildren }) => (
      <th className="border border-border px-2 py-1 text-left font-semibold">
        {thChildren}
      </th>
    ),
    td: ({ children: tdChildren }) => (
      <td className="border border-border px-2 py-1">{tdChildren}</td>
    ),
  }), []);

  return (
    <div className={className}>
      <Markdown remarkPlugins={remarkPlugins} components={components}>
        {children}
      </Markdown>
    </div>
  );
};
