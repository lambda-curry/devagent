/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EpicMetaCard } from '~/components/EpicMetaCard';

describe('EpicMetaCard', () => {
  it('renders empty state when prUrl is null', () => {
    render(<EpicMetaCard prUrl={null} />);
    expect(screen.getByText('Pull request')).toBeInTheDocument();
    expect(screen.getByText(/No PR link for this epic/)).toBeInTheDocument();
    expect(screen.getByText(/No PR link for this epic/)).toBeInTheDocument();
    expect(screen.getByText('pr_url')).toBeInTheDocument();
  });

  it('renders PR link when prUrl is set', () => {
    const prUrl = 'https://github.com/org/repo/pull/90';
    render(<EpicMetaCard prUrl={prUrl} />);
    expect(screen.getByText('Pull request')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'View pull request on GitHub' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', prUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('View PR')).toBeInTheDocument();
  });
});
