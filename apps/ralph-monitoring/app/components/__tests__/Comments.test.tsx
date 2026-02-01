/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { Comments } from '../Comments';
import type { BeadsComment } from '~/db/beads.types';

const createComment = (overrides: Partial<BeadsComment> = {}): BeadsComment => {
  return {
    id: 1,
    author: 'User',
    body: 'Test comment body',
    created_at: '2026-01-17T12:00:00Z',
    ...overrides,
  };
};

function renderComments(props: { taskId: string; comments: BeadsComment[] }) {
  const Stub = createRoutesStub([
    {
      path: '/',
      Component: () => <Comments {...props} />,
    },
  ]);
  return render(<Stub initialEntries={['/']} />);
}

describe('Comments', () => {
  describe('Empty State', () => {
    it('should show empty state when no comments exist', () => {
      renderComments({ taskId: 'task-1', comments: [] });
      expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
      expect(screen.getByText('Comments')).toBeInTheDocument();
    });

    it('should show message about when comments will appear', () => {
      renderComments({ taskId: 'task-1', comments: [] });
      expect(
        screen.getByText(/Comments will appear here when added to this task/)
      ).toBeInTheDocument();
    });

    it('should show Add Comment button in empty state', () => {
      renderComments({ taskId: 'task-1', comments: [] });
      expect(screen.getByRole('button', { name: /add comment/i })).toBeInTheDocument();
    });
  });

  describe('With Comments', () => {
    it('should render comment count in header', () => {
      const comments = [
        createComment({ id: 1, body: 'Comment 1' }),
        createComment({ id: 2, body: 'Comment 2' }),
        createComment({ id: 3, body: 'Comment 3' }),
      ];
      renderComments({ taskId: 'task-1', comments });
      expect(screen.getByText('Comments (3)')).toBeInTheDocument();
    });

    it('should render comment author', () => {
      const comments = [
        createComment({ id: 1, author: 'TestUser', body: 'Test' }),
      ];
      renderComments({ taskId: 'task-1', comments });
      expect(screen.getByText('TestUser')).toBeInTheDocument();
    });

    it('should render comment timestamps', () => {
      const comments = [
        createComment({ created_at: '2026-01-17T12:00:00Z' }),
      ];
      renderComments({ taskId: 'task-1', comments });
      // Check that date is formatted and displayed
      const dateElement = screen.getByText(/2026/);
      expect(dateElement).toBeInTheDocument();
    });

    it('should render multiple comments', () => {
      const comments = [
        createComment({ id: 1, body: 'First comment' }),
        createComment({ id: 2, body: 'Second comment' }),
      ];
      renderComments({ taskId: 'task-1', comments });
      expect(screen.getByText('First comment')).toBeInTheDocument();
      expect(screen.getByText('Second comment')).toBeInTheDocument();
    });

    it('should show edit and delete buttons for each comment', () => {
      const comments = [
        createComment({ id: 1, body: 'Test comment' }),
      ];
      renderComments({ taskId: 'task-1', comments });
      expect(screen.getByTitle('Edit comment')).toBeInTheDocument();
      expect(screen.getByTitle('Delete comment')).toBeInTheDocument();
    });
  });

  describe('Markdown Rendering', () => {
    it('should render bold text in comments', () => {
      const comments = [
        createComment({ body: '**bold text** in comment' }),
      ];
      renderComments({ taskId: 'task-1', comments });
      const boldElement = screen.getByText('bold text');
      expect(boldElement.tagName).toBe('STRONG');
    });

    it('should render inline code in comments', () => {
      const comments = [
        createComment({ body: 'Use `code` here' }),
      ];
      renderComments({ taskId: 'task-1', comments });
      const codeElement = screen.getByText('code');
      expect(codeElement.tagName).toBe('CODE');
    });

    it('should render links in comments', () => {
      const comments = [
        createComment({ body: 'Check [this link](https://example.com)' }),
      ];
      renderComments({ taskId: 'task-1', comments });
      const link = screen.getByRole('link', { name: 'this link' });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should render lists in comments', () => {
      const comments = [
        createComment({
          body: `- Item 1
- Item 2
- Item 3`,
        }),
      ];
      const { container } = renderComments({ taskId: 'task-1', comments });
      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(3);
    });

    it('should render task lists in comments', () => {
      const comments = [
        createComment({
          body: `- [x] Done
- [ ] Todo`,
        }),
      ];
      const { container } = renderComments({ taskId: 'task-1', comments });
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it('should render code blocks in comments', () => {
      const comments = [
        createComment({
          body: `\`\`\`javascript
const x = 1;
\`\`\``,
        }),
      ];
      const { container } = renderComments({ taskId: 'task-1', comments });
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
    });

    it('should render typical Beads commit comment format', () => {
      const comments = [
        createComment({
          body: `Commit: abc1234 - feat: add new feature

## Summary

**Changes:**
- Added new component
- Updated tests

\`\`\`bash
bun test
\`\`\``,
        }),
      ];
      renderComments({ taskId: 'task-1', comments });

      expect(screen.getByText(/Commit: abc1234/)).toBeInTheDocument();
      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText('Changes:')).toBeInTheDocument();
    });

    it('should render revision learning comment format', () => {
      const comments = [
        createComment({
          body: `Revision Learning:
**Category**: Process
**Priority**: Medium
**Issue**: Workflow could be improved.
**Recommendation**: Add automation.`,
        }),
      ];
      renderComments({ taskId: 'task-1', comments });

      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Issue')).toBeInTheDocument();
      expect(screen.getByText('Recommendation')).toBeInTheDocument();
    });
  });

  describe('Security', () => {
    it('should not execute script tags in comments', () => {
      const comments = [
        createComment({
          body: '<script>alert("xss")</script>',
        }),
      ];
      renderComments({ taskId: 'task-1', comments });
      // Script should not be rendered as an actual script element
      const script = document.querySelector('script');
      expect(script).toBeNull();
    });

    it('should sanitize javascript: links in comments', () => {
      const comments = [
        createComment({
          body: '[Click me](javascript:alert("xss"))',
        }),
      ];
      renderComments({ taskId: 'task-1', comments });
      const link = screen.queryByRole('link');
      if (link) {
        expect(link.getAttribute('href')).not.toContain('javascript:');
      }
    });

    it('should not render HTML img tags with onerror', () => {
      const comments = [
        createComment({
          body: '<img src="x" onerror="alert(\'xss\')">',
        }),
      ];
      const { container } = renderComments({ taskId: 'task-1', comments });
      const img = container.querySelector('img');
      expect(img).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle comments with only whitespace', () => {
      const comments = [
        createComment({ body: '   \n\n   ' }),
      ];
      // Should render without error
      renderComments({ taskId: 'task-1', comments });
      expect(screen.getByText('Comments (1)')).toBeInTheDocument();
    });

    it('should handle very long comments', () => {
      const longBody = 'Word '.repeat(500);
      const comments = [
        createComment({ body: longBody }),
      ];
      renderComments({ taskId: 'task-1', comments });
      expect(screen.getByText(/Word Word Word/)).toBeInTheDocument();
    });

    it('should handle comments with mixed markdown and text', () => {
      const comments = [
        createComment({
          body: 'Normal text **bold** more text `code` and *italic*',
        }),
      ];
      renderComments({ taskId: 'task-1', comments });
      expect(screen.getByText('bold').tagName).toBe('STRONG');
      expect(screen.getByText('code').tagName).toBe('CODE');
      expect(screen.getByText('italic').tagName).toBe('EM');
    });
  });

  describe('Performance', () => {
    it('should render 10+ comments without issues', () => {
      const comments = Array.from({ length: 15 }, (_, i) =>
        createComment({
          id: i + 1,
          body: `Comment ${i + 1} with **bold** and \`code\``,
          created_at: new Date(Date.now() - i * 60000).toISOString(),
        })
      );

      const startTime = performance.now();
      renderComments({ taskId: 'task-1', comments });
      const endTime = performance.now();

      // Should render in less than 500ms
      expect(endTime - startTime).toBeLessThan(500);

      // All comments should be rendered
      expect(screen.getByText('Comments (15)')).toBeInTheDocument();
      // Use exact match with word boundaries to avoid matching Comment 10, 11, etc.
      expect(screen.getByText(/Comment 1 with/)).toBeInTheDocument();
      expect(screen.getByText(/Comment 15 with/)).toBeInTheDocument();
    });

    it('should handle comments with complex markdown', () => {
      const complexMarkdown = `# Title

**Bold** and *italic* with \`inline code\`

\`\`\`javascript
const x = {
  key: 'value',
  nested: { a: 1, b: 2 }
};
\`\`\`

- [x] Task 1
- [ ] Task 2
- Regular item

| Header | Value |
| --- | --- |
| A | 1 |

> Blockquote text

[Link](https://example.com)`;

      const comments = Array.from({ length: 10 }, (_, i) =>
        createComment({
          id: i + 1,
          body: complexMarkdown,
        })
      );

      const startTime = performance.now();
      renderComments({ taskId: 'task-1', comments });
      const endTime = performance.now();

      // Should render in less than 1 second even with complex markdown
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
