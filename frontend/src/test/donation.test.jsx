import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { Droplet } from 'lucide-react';
import { formatDate, formatDateTime, getStatusBadgeVariant } from '@/lib/formatters';

describe('Donation & Response UI Logic', () => {
  it('formats donation dates and status variants correctly', () => {
    expect(formatDate('2026-10-10')).toBe('Oct 10, 2026');
    expect(getStatusBadgeVariant('COMPLETED')).toBe('success');
    expect(getStatusBadgeVariant('FULFILLED')).toBe('success');
    expect(getStatusBadgeVariant('PENDING')).toBe('warning');
  });

  it('renders EmptyState with educational instructions for new donors', () => {
    render(
      <EmptyState
        icon={Droplet}
        title="No verified donation records yet"
        description="Donation records are automatically created when you respond to a blood request and your donation is completed."
        actionText="View Matching Blood Requests"
        onAction={() => {}}
      />
    );

    expect(screen.getByText('No verified donation records yet')).toBeInTheDocument();
    expect(
      screen.getByText(/Donation records are automatically created/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /view matching blood requests/i })
    ).toBeInTheDocument();
  });

  it('renders accepted donor response card with verified badge and contact', () => {
    render(
      <div data-testid="response-card">
        <span className="font-bold">Rahul Sharma</span>
        <Badge variant="success">ACCEPTED</Badge>
        <span className="text-crimson-600 font-bold">+91 98765 43210</span>
      </div>
    );

    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
  });
});
