/**
 * StatCard Component Tests
 * 
 * Tests for the StatCard component:
 * - Renders stat card with title and value
 * - Displays trend indicators
 * - Handles different variants
 */

import React from 'react';
import { screen, render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import StatCard from '../../shared/components/ui/StatCard';

describe('StatCard', () => {
  test('renders stat card with title and value', () => {
    render(<StatCard title="Total Revenue" value="1000" />);
    expect(screen.getByText(/total revenue/i)).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  test('displays change indicator', () => {
    render(<StatCard title="Sales" value="500" change="+10%" />);
    expect(screen.getByText(/sales/i)).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
  });

  test('renders with icon', () => {
    const TestIcon = () => <span data-testid="stat-icon">Icon</span>;
    render(<StatCard title="Revenue" value="1000" icon={<TestIcon />} />);
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
  });

  test('handles different variants', () => {
    const { rerender } = render(<StatCard title="Test" value="100" variant="primary" />);
    expect(screen.getByText(/test/i)).toBeInTheDocument();

    rerender(<StatCard title="Test" value="100" variant="success" />);
    expect(screen.getByText(/test/i)).toBeInTheDocument();

    rerender(<StatCard title="Test" value="100" variant="danger" />);
    expect(screen.getByText(/test/i)).toBeInTheDocument();
  });
});

