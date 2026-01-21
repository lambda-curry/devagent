/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });

  it('should apply variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('bg-destructive');
  });

  it('should support asChild for links', () => {
    render(
      <Button asChild>
        <a href="/tasks/123">View task</a>
      </Button>
    );

    const link = screen.getByRole('link', { name: 'View task' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass('inline-flex');
  });
});
