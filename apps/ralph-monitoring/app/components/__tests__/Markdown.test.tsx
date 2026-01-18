/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownContent } from '../Markdown';

describe('MarkdownContent', () => {
  describe('Basic Rendering', () => {
    it('should render plain text', () => {
      render(<MarkdownContent>Hello world</MarkdownContent>);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('should render bold text', () => {
      render(<MarkdownContent>**bold text**</MarkdownContent>);
      const boldElement = screen.getByText('bold text');
      expect(boldElement).toBeInTheDocument();
      expect(boldElement.tagName).toBe('STRONG');
    });

    it('should render italic text', () => {
      render(<MarkdownContent>*italic text*</MarkdownContent>);
      const italicElement = screen.getByText('italic text');
      expect(italicElement).toBeInTheDocument();
      expect(italicElement.tagName).toBe('EM');
    });

    it('should render inline code', () => {
      render(<MarkdownContent>Use `inline code` here</MarkdownContent>);
      const codeElement = screen.getByText('inline code');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement.tagName).toBe('CODE');
      expect(codeElement).toHaveClass('bg-muted');
    });
  });

  describe('Code Blocks', () => {
    it('should render fenced code blocks', () => {
      const markdown = `\`\`\`javascript
const x = 1;
\`\`\``;
      render(<MarkdownContent>{markdown}</MarkdownContent>);
      const codeElement = screen.getByText('const x = 1;');
      expect(codeElement).toBeInTheDocument();
      // Code block should be in a pre element
      const preElement = codeElement.closest('pre');
      expect(preElement).toBeInTheDocument();
    });

    it('should style code blocks with background', () => {
      const markdown = `\`\`\`
code block
\`\`\``;
      const { container } = render(<MarkdownContent>{markdown}</MarkdownContent>);
      const preElement = container.querySelector('pre');
      expect(preElement).toHaveClass('bg-muted');
    });
  });

  describe('Lists', () => {
    it('should render unordered lists', () => {
      const markdown = `- Item 1
- Item 2
- Item 3`;
      const { container } = render(<MarkdownContent>{markdown}</MarkdownContent>);
      const ulElement = container.querySelector('ul');
      expect(ulElement).toBeInTheDocument();
      expect(ulElement).toHaveClass('list-disc');
      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(3);
    });

    it('should render ordered lists', () => {
      const markdown = `1. First
2. Second
3. Third`;
      const { container } = render(<MarkdownContent>{markdown}</MarkdownContent>);
      const olElement = container.querySelector('ol');
      expect(olElement).toBeInTheDocument();
      expect(olElement).toHaveClass('list-decimal');
    });

    it('should render task lists (GFM)', () => {
      const markdown = `- [x] Completed task
- [ ] Incomplete task`;
      const { container } = render(<MarkdownContent>{markdown}</MarkdownContent>);
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });
  });

  describe('Links', () => {
    it('should render links with target="_blank"', () => {
      render(<MarkdownContent>[Click here](https://example.com)</MarkdownContent>);
      const link = screen.getByRole('link', { name: 'Click here' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render autolinks (GFM)', () => {
      render(<MarkdownContent>Visit https://example.com for more</MarkdownContent>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('XSS Prevention', () => {
    it('should not render dangerous javascript: links', () => {
      // react-markdown sanitizes dangerous URLs by default
      render(<MarkdownContent>[Click](javascript:alert('xss'))</MarkdownContent>);
      const link = screen.queryByRole('link');
      // Link should either not render or have sanitized href
      if (link) {
        expect(link.getAttribute('href')).not.toContain('javascript:');
      }
    });

    it('should not render dangerous data: URLs', () => {
      render(<MarkdownContent>[Click](data:text/html,&lt;script&gt;alert('xss')&lt;/script&gt;)</MarkdownContent>);
      const link = screen.queryByRole('link');
      if (link) {
        expect(link.getAttribute('href')).not.toContain('data:text/html');
      }
    });

    it('should handle script tags in markdown as text', () => {
      // react-markdown renders as React elements, not innerHTML
      // so script tags become escaped text
      render(<MarkdownContent>{'<script>alert("xss")</script>'}</MarkdownContent>);
      // Should not find an actual script element
      const scriptElement = document.querySelector('script');
      expect(scriptElement).toBeNull();
    });

    it('should handle HTML injection attempts', () => {
      const malicious = `<img src="x" onerror="alert('xss')">`;
      const { container } = render(<MarkdownContent>{malicious}</MarkdownContent>);
      // react-markdown doesn't render raw HTML by default
      const img = container.querySelector('img');
      expect(img).toBeNull();
    });
  });

  describe('GFM Features', () => {
    it('should render strikethrough', () => {
      render(<MarkdownContent>~~deleted~~</MarkdownContent>);
      const delElement = screen.getByText('deleted');
      expect(delElement).toBeInTheDocument();
      expect(delElement.tagName).toBe('DEL');
    });

    it('should render tables', () => {
      const markdown = `| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |`;
      const { container } = render(<MarkdownContent>{markdown}</MarkdownContent>);
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
      expect(screen.getByText('Header 1')).toBeInTheDocument();
      expect(screen.getByText('Cell 1')).toBeInTheDocument();
    });
  });

  describe('Headings', () => {
    it('should render headings with scaled sizing', () => {
      const markdown = `# Heading 1
## Heading 2
### Heading 3`;
      const { container } = render(<MarkdownContent>{markdown}</MarkdownContent>);

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();

      expect(h1).toHaveClass('text-lg');
      expect(h2).toHaveClass('text-base');
      expect(h3).toHaveClass('text-sm');
    });
  });

  describe('Blockquotes', () => {
    it('should render blockquotes with styling', () => {
      render(<MarkdownContent>{'> This is a quote'}</MarkdownContent>);
      const blockquote = document.querySelector('blockquote');
      expect(blockquote).toBeInTheDocument();
      expect(blockquote).toHaveClass('border-l-2');
    });
  });

  describe('Complex Markdown', () => {
    it('should render typical Beads comment format', () => {
      const typicalComment = `Commit: 1d59bf13 - docs: add markdown rendering research

## Summary

**Recommendation:** react-markdown + remark-gfm

### Key Findings:
- **Bundle size:** ~75KB total
- **Security:** Built-in XSS protection
- **GFM features:** Task lists, code blocks, tables

\`\`\`bash
bun add react-markdown remark-gfm
\`\`\``;

      render(<MarkdownContent>{typicalComment}</MarkdownContent>);

      // Check various elements rendered
      expect(screen.getByText(/Commit: 1d59bf13/)).toBeInTheDocument();
      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText(/Recommendation:/)).toBeInTheDocument();
      expect(screen.getByText(/Bundle size:/)).toBeInTheDocument();
      expect(screen.getByText(/bun add react-markdown remark-gfm/)).toBeInTheDocument();
    });

    it('should render revision learning format', () => {
      const revisionLearning = `Revision Learning:
**Category**: Documentation
**Priority**: Low
**Issue**: Research task completed efficiently.
**Recommendation**: Consider adding a "Quick Start" section.
**Files/Rules Affected**: None`;

      render(<MarkdownContent>{revisionLearning}</MarkdownContent>);

      // Check that bold labels are rendered correctly
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Category').tagName).toBe('STRONG');
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Issue')).toBeInTheDocument();
      expect(screen.getByText('Recommendation')).toBeInTheDocument();
      // Check content is visible using regex for flexibility
      expect(screen.getByText(/Documentation/)).toBeInTheDocument();
      expect(screen.getByText(/Research task completed efficiently/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const { container } = render(<MarkdownContent>{''}</MarkdownContent>);
      expect(container.textContent).toBe('');
    });

    it('should handle whitespace-only content', () => {
      render(<MarkdownContent>{'   \n\n   '}</MarkdownContent>);
      // Should render without error
      expect(document.body).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'Word '.repeat(1000);
      render(<MarkdownContent>{longContent}</MarkdownContent>);
      expect(screen.getByText(/Word Word Word/)).toBeInTheDocument();
    });

    it('should apply custom className to wrapper', () => {
      const { container } = render(
        <MarkdownContent className="custom-class">Test</MarkdownContent>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });
});
