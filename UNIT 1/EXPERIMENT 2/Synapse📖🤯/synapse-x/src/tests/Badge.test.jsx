import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Badge from '../components/common/Badge';

describe('Badge component', () => {
  it('renders the label for a known status', () => {
    render(<Badge status="published" />);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('renders custom children when provided', () => {
    render(<Badge status="draft">Custom label</Badge>);
    expect(screen.getByText('Custom label')).toBeInTheDocument();
  });

  it('applies a tone-specific class', () => {
    const { container } = render(<Badge status="archived" />);
    expect(container.querySelector('.badge--archived')).toBeTruthy();
  });
});
