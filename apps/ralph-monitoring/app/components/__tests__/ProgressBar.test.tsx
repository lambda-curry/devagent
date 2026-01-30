/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with value and optional label', () => {
    render(<ProgressBar value={50} label="50%" />);
    const bar = screen.getByRole('progressbar', { name: undefined });
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('clamps value to 0–100', () => {
    const { rerender } = render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<ProgressBar value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('handles invalid value as 0', () => {
    render(<ProgressBar value={Number.NaN} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('applies custom className', () => {
    const { container } = render(<ProgressBar value={50} className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('matches snapshot for default state', () => {
    const { container } = render(<ProgressBar value={65} label="65%" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for color variants', () => {
    const { container } = render(
      <ProgressBar value={80} label="80%" color="destructive" />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
