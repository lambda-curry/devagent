/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownSection } from '../MarkdownSection';
import { FileText } from 'lucide-react';

// Mock MarkdownContent to simplify testing
vi.mock('../Markdown', () => ({
  MarkdownContent: ({ children }: { children: string }) => (
    <div data-testid="markdown-content">{children}</div>
  )
}));

describe('MarkdownSection', () => {
  it('should render section with title and content', () => {
    render(
      <MarkdownSection
        title="Description"
        content="This is the description content."
      />
    );

    expect(screen.getByRole('heading', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByTestId('markdown-content')).toHaveTextContent('This is the description content.');
  });

  it('should render icon when provided', () => {
    render(
      <MarkdownSection
        title="Description"
        content="Content"
        icon={FileText}
      />
    );

    // The icon should be rendered (lucide icons render as SVG)
    const section = screen.getByRole('heading', { name: 'Description' }).parentElement;
    expect(section?.querySelector('svg')).toBeInTheDocument();
  });

  it('should not render icon when not provided', () => {
    render(
      <MarkdownSection
        title="Description"
        content="Content"
      />
    );

    const section = screen.getByRole('heading', { name: 'Description' }).parentElement;
    expect(section?.querySelector('svg')).not.toBeInTheDocument();
  });

  it('should return null when content is null', () => {
    const { container } = render(
      <MarkdownSection
        title="Description"
        content={null}
      />
    );

    expect(container.innerHTML).toBe('');
  });

  it('should return null when content is empty string', () => {
    const { container } = render(
      <MarkdownSection
        title="Description"
        content=""
      />
    );

    expect(container.innerHTML).toBe('');
  });

  it('should return null when content is whitespace only', () => {
    const { container } = render(
      <MarkdownSection
        title="Description"
        content="   "
      />
    );

    expect(container.innerHTML).toBe('');
  });

  it('should apply custom className', () => {
    render(
      <MarkdownSection
        title="Description"
        content="Content"
        className="custom-class"
      />
    );

    const section = screen.getByRole('heading', { name: 'Description' }).closest('div.mb-6');
    expect(section).toHaveClass('custom-class');
  });

  it('should render markdown content through MarkdownContent component', () => {
    const markdownContent = '**Bold** and `code`';
    render(
      <MarkdownSection
        title="Description"
        content={markdownContent}
      />
    );

    expect(screen.getByTestId('markdown-content')).toHaveTextContent(markdownContent);
  });
});
