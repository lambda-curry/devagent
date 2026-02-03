/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../MetricCard';

describe('MetricCard', () => {
  it('renders title and value', () => {
    render(<MetricCard title="Tasks complete" value="12" />);
    expect(screen.getByText('Tasks complete')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders optional subtitle', () => {
    render(
      <MetricCard
        title="Time elapsed"
        value="2h 34m"
        subtitle="Last run"
      />
    );
    expect(screen.getByText('Time elapsed')).toBeInTheDocument();
    expect(screen.getByText('2h 34m')).toBeInTheDocument();
    expect(screen.getByText('Last run')).toBeInTheDocument();
  });

  it('renders value as ReactNode', () => {
    render(
      <MetricCard
        title="Status"
        value={<span data-testid="custom-value">Running</span>}
      />
    );
    expect(screen.getByTestId('custom-value')).toHaveTextContent('Running');
  });

  it('applies custom className', () => {
    const { container } = render(
      <MetricCard title="X" value="1" className="custom-card" />
    );
    const card = container.querySelector('.custom-card');
    expect(card).toBeInTheDocument();
  });

  it('renders value with metric styling', () => {
    const { container } = render(
      <MetricCard title="Tasks complete" value="6" />
    );
    const value = container.querySelector('.text-2xl');
    expect(value).toBeInTheDocument();
  });

  it('renders subtitle with muted styling', () => {
    const { container } = render(
      <MetricCard
        title="Time elapsed"
        value="1h 12m"
        subtitle="Current session"
      />
    );
    const subtitle = container.querySelector('.text-xs');
    expect(subtitle).toBeInTheDocument();
  });
});
