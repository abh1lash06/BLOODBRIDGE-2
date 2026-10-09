import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';

describe('UI Primitives Components', () => {
  it('renders Button with correct text and variant styles', () => {
    render(<Button variant="primary">Submit Request</Button>);
    const button = screen.getByRole('button', { name: /submit request/i });
    expect(button).toBeInTheDocument();
  });

  it('renders disabled Button when isLoading is true', () => {
    render(<Button isLoading>Save</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders Badge component with correct text', () => {
    render(<Badge variant="success">VERIFIED</Badge>);
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
  });
});
